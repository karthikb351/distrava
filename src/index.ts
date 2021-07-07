import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
const express = require('express');
import {handleConnectCommand} from './commands/connect';
import {handleLastActivityCommand} from './commands/get_last_activity';
import {handleRemoveSubscriptionCommand} from './commands/remove_subscription';
import {handleSetupSubscriptionCommand} from './commands/setup_subscriptions';
import {handleSubscriptionCommand} from './commands/subscribe';
import {handleUnsubscribeCommand} from './commands/unsubscribe';
import {config} from './config';
import {
  responseToInteraction,
  strava,
  datastore,
  kind,
  gstore,
  constructWebhookMessageForActivity,
  postToWebhook,
} from './lib';
import {SubscriptionModel} from './models/subscription';
import {UserModel} from './models/user';
import {WebhookModel} from './models/webhook';

// Create an Express object and routes (in order)
const app = express();

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
    let response;

    if (
      interaction &&
      interaction.type === InteractionType.APPLICATION_COMMAND
    ) {
      const interaction_token = interaction.token;

      switch (interaction.data.name) {
        case 'connect':
          res.send(getAckMessage(true));
          response = await handleConnectCommand(interaction);
          await responseToInteraction(interaction_token, response);
          break;
        case 'get_last_activity':
          res.send(getAckMessage(false));
          response = await handleLastActivityCommand(interaction);
          await responseToInteraction(interaction_token, response);
          break;
        case 'setup_subscriptions':
          res.send(getAckMessage(true));
          response = await handleSetupSubscriptionCommand(interaction);
          await responseToInteraction(interaction_token, response);
          break;
        case 'remove_subscriptions':
          res.send(getAckMessage(true));
          response = await handleRemoveSubscriptionCommand(interaction);
          await responseToInteraction(interaction_token, response);
          break;
        case 'subscribe':
          res.send(getAckMessage(true));
          response = await handleSubscriptionCommand(interaction);
          await responseToInteraction(interaction_token, response);
          break;
        case 'unsubscribe':
          res.send(getAckMessage(true));
          response = await handleUnsubscribeCommand(interaction);
          await responseToInteraction(interaction_token, response);
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

app.get('/strava/redirect', async (req, res) => {
  const code = (req.query.code as string) || '';
  const state = JSON.parse((req.query.state as string) || '{}');

  const user = await UserModel.findOne({discord_user_id: state.user_id});
  const response: {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
  } = await strava.oauth.getToken(code);

  const stravaClient = new strava.client(response.access_token);
  const athlete = await stravaClient.athlete.get();
  user.strava_athlete_id = athlete.id.toString();
  user.strava_athlete_profile_picture = athlete.profile;
  user.strava_refresh_token = response.refresh_token;
  user.strava_access_token = response.access_token;
  await user.save();

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
  const data = req.body;
  res.send();
  if (data.object_type === 'activity' && data.aspect_type !== 'delete') {
    const athleteId = data.owner_id.toString();
    const activityId = data.object_id;

    let user;
    try {
      user = await UserModel.findOne({strava_athlete_id: athleteId});
      const stravaClient = new strava.client(user.strava_access_token);
      const activity = await stravaClient.activities.get({id: activityId});
      try {
        // List of subscriptions for a given user
        const subscriptions = await SubscriptionModel.query()
          .filter('user_id', user.entityKey)
          .run();

        if (subscriptions.entities.length === 0) {
          console.log(
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
            console.log(e);
          }
        });
        await Promise.all(webhookPromises);
      } catch (e) {
        console.log(e);
      }
      // Lookup datastore via strava athlete ID
      // Lookup which channel to post for that athlete
      // Find all webhooks to post to for this athlete, and push them to pub/sub
      // end
    } catch (e) {
      console.log(e);
      return;
    }
  }
});

app.get('/', (req, res) => {
  res.send("We're running!");
});

// Set our GCF handler to our Express app.
exports.distrava = app;
