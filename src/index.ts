import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import {connectCommand} from './commands/connect';
import {getLastActivityCommand} from './commands/get_last_activity';
import {removeSubscriptionCommand} from './commands/remove_subscription';
import {setupSubscriptionsCommand} from './commands/setup_subscriptions';
import {subscribeCommand} from './commands/subscribe';
import {unsubscribeCommand} from './commands/unsubscribe';
import express from 'express';
import {config} from './config';
import {
  responseToInteraction,
  constructWebhookMessageForActivity,
  postToWebhook,
  publishInteractionMessage,
  decryptString,
  publishStravaWebhookMessage,
} from './lib';
import {SubscriptionModel} from './models/subscription';
import {UserModel} from './models/user';
import {WebhookModel} from './models/webhook';
import {logger} from './logger';
import {StravaUserClient} from './strava';

// Create an Express object and routes (in order)
const app = express();

const commands = {
  connect: connectCommand,
  get_last_activity: getLastActivityCommand,
  remove_subscriptions: removeSubscriptionCommand,
  setup_subscriptions: setupSubscriptionsCommand,
  subscribe: subscribeCommand,
  unsubscribe: unsubscribeCommand,
};

const getAckMessage = (ephemeral = false) => {
  return {
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "I'm trying :(",
      flags: ephemeral ? InteractionResponseFlags.EPHEMERAL : undefined,
    },
  };
};

app.post(
  '/interactions',
  verifyKeyMiddleware(config.discord.public_key),
  async (req, res) => {
    const interaction = req.body;

    if (
      interaction &&
      interaction.type === InteractionType.APPLICATION_COMMAND
    ) {
      const interaction_token = interaction.token;

      await publishInteractionMessage(interaction);
      switch (interaction.data.name) {
        case 'connect':
          res.send(getAckMessage(true));
          break;
        case 'get_last_activity':
          res.send(getAckMessage(false));
          break;
        case 'setup_subscriptions':
          res.send(getAckMessage(true));
          break;
        case 'remove_subscriptions':
          res.send(getAckMessage(true));
          break;
        case 'subscribe':
          res.send(getAckMessage(true));
          break;
        case 'unsubscribe':
          res.send(getAckMessage(true));
          break;
        default:
          await responseToInteraction(interaction_token, '?');
      }
    } else {
      res.send({
        type: InteractionResponseType.PONG,
      });
    }
  }
);

app.post('/interaction-subscription', async (req, res) => {
  const base64 = req.body.message.data;
  const decodedString = Buffer.from(base64, 'base64').toString();
  const interaction = JSON.parse(decodedString);
  const interaction_token = interaction.token;
  let response;
  let result;
  const command = commands[interaction.data.name];
  if (command) {
    result = await command.prerequisite(interaction);
    if (result.check) {
      response = await command.exec(interaction, result.data);
    } else {
      response = result.data;
    }
    await command.sideeffect(interaction, result.data);
    await responseToInteraction(interaction_token, response);
  } else {
    await responseToInteraction(interaction_token, {
      content: 'Whoops. Something went wrong.',
    });
  }

  res.send('ok');
});

app.get('/strava/redirect', async (req, res) => {
  const code = (req.query.code as string) || '';
  let state;
  try {
    state = JSON.parse(decryptString(JSON.parse(req.query.state as string)));
    const now = new Date().getTime();
    if (now - parseInt(state.timestamp) > 5 * 60 * 1000) {
      res.send(
        'You took too long! Please authorize the app within 5 minutes of running the `/connect` command'
      );
      return;
    }
  } catch (e) {
    logger.error(e);
    res.send(
      'Looks like something went wrong. Please run the `/connect` command again'
    );
    return;
  }

  const user = await UserModel.findOne({discord_user_id: state.user_id});
  const response: {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
  } = await StravaUserClient.getToken(code);

  user.strava_refresh_token = response.refresh_token;
  user.strava_access_token = response.access_token;
  user.strava_access_token_expires_at = response.expires_at;
  await user.save();
  const stravaClient = new StravaUserClient(user);
  const athlete = await stravaClient.getAthlete();
  user.strava_athlete_id = athlete.id.toString();
  user.strava_athlete_profile_picture = athlete.profile;
  await user.save();

  await responseToInteraction(state.interaction_token, {
    content: 'All good! Your account is connected.',
  });

  res.send('All good! Your account is connected.');
});

app.get('/strava/webhook', async (req, res) => {
  const data = req.query;
  if (
    data['hub.mode'] === 'subscribe' &&
    data['hub.verify_token'] === 'somerandomsecret'
  ) {
    res.json({
      'hub.challenge': data['hub.challenge'],
    });
    return;
  }
  res.status(500).send('Invalid verification');
});

app.post('/strava/webhook', async (req, res) => {
  logger.info(
    `Finagle-Ctx-Com.twitter.finagle.deadline: ${req.header(
      'Finagle-Ctx-Com.twitter.finagle.deadline'
    )}`
  );

  logger.info(
    `Finagle-Ctx-Com.twitter.finagle.retries: ${req.header(
      'Finagle-Ctx-Com.twitter.finagle.retries'
    )}`
  );

  const ackRetries = req.header('Finagle-Ctx-Com.twitter.finagle.retries');

  // Strava uses twitter's finangle for its webhook processing, and we can access the acknowledge timeout here - https://twitter.github.io/finagle/guide/Protocols.html#http
  const ackTimeoutNs = req
    .header('Finagle-Ctx-Com.twitter.finagle.deadline')
    .split(' ')?.[1];

  const ackTimeoutMs = Math.floor(parseInt(ackTimeoutNs) / (1000 * 1000));

  // Set timeout headroom to 500ms
  const aggressiveAckTimeoutDate = new Date(ackTimeoutMs - 500);

  logger.info(
    `Time (ms) between current time and deadline: ${
      new Date().getTime() - ackTimeoutMs
    }`
  );

  logger.info(
    `Time (ms) between current time and aggressive deadline: ${
      new Date().getTime() - aggressiveAckTimeoutDate.getTime()
    }`
  );

  // If we aren't within the timeout window we should reject and allow Strava to retry us.
  if (aggressiveAckTimeoutDate < new Date() && parseInt(ackRetries) < 2) {
    logger.info(
      `Cannot meet aggressive deadline of ${aggressiveAckTimeoutDate.toISOString()}. Retry count: ${ackRetries}`
    );
    res.status(500).send();
    return;
  }

  const data = req.body;

  res.send();
  // Push to GCP's Pub/Sub
  if (data.object_type === 'activity' && data.aspect_type === 'create') {
    logger.info(
      `Publishing activity: '${data.object_id}' for athlete: '${data.owner_id}'`
    );
    await publishStravaWebhookMessage(data);
    logger.info(
      `Successefully published activity: ';${data.object_id}' for athlete: '${data.owner_id}'`
    );
  } else {
    logger.info(
      `Ignoring. Object type is '${data.object_type}' and aspect type is '${data.aspect_type}'`
    );
  }
});

app.post('/strava-webhook-subscription', async (req, res) => {
  const base64 = req.body.message.data;
  const decodedString = Buffer.from(base64, 'base64').toString();
  const data = JSON.parse(decodedString);
  const athleteId = data.owner_id.toString();
  const activityId = data.object_id;

  let user;
  try {
    user = await UserModel.findOne({strava_athlete_id: athleteId});
    const stravaClient = new StravaUserClient(user);
    const activity = await stravaClient.getActivityById(activityId);
    try {
      // List of subscriptions for a given user
      const subscriptions = await SubscriptionModel.query()
        .filter('user_id', user.entityKey)
        .run();

      if (subscriptions.entities.length === 0) {
        logger.info(
          `No subscriptions found for Strava athlete id: ${athleteId}`
        );
        return;
      }
      // Array to hold final webhooks data
      const webhooks = [];

      // Promise array for finding webhooks for a given subscription
      const webhookQueryPromises = [];
      subscriptions.entities.forEach(subscription => {
        webhookQueryPromises.push(
          WebhookModel.findOne({
            __key__: subscription.webhook_id,
          })
        );
      });
      await Promise.all(webhookQueryPromises).then(_arr =>
        _arr.forEach(val => webhooks.push(val))
      );

      const webhookPromises = [];
      webhooks.forEach(webhook => {
        try {
          const webhookMessage = constructWebhookMessageForActivity(
            user,
            activity
          );
          webhookPromises.push(
            postToWebhook(
              webhook.discord_webhook_id,
              webhook.discord_webhook_token,
              webhookMessage
            )
          );
          // Push to pub/sub queue
        } catch (e) {
          logger.error(e);
        }
      });
      await Promise.all(webhookPromises);
    } catch (e) {
      logger.error(e);
    }
    // Lookup datastore via strava athlete ID
    // Lookup which channel to post for that athlete
    // Find all webhooks to post to for this athlete, and push them to pub/sub
    // end
  } catch (e) {
    logger.error(e);
    return;
  }

  res.send('ok');
});

app.get('/', (req, res) => {
  res.send("We're running!");
});

// Set our GCF handler to our Express app.
exports.distrava = app;
