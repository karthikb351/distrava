import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
const express = require('express');
import {handleConnectCommand} from './commands/connect';
import {handleLastActivityCommand} from './commands/get_last_activity';
import {
  postToWebhook,
  responseToInteraction,
  strava,
  datastore,
  kind,
  gstore,
} from './lib';
import {UserModel} from './models/user';

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
  verifyKeyMiddleware(
    '3aa4149e26f777c952202ba6b5673d52bef199b129bd6e273f012f9988280b8b'
  ),
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
        case 'subscribe_to_feed':
          // Create a webhook on this discord channel
          // Store webhook + athlete mapping in datastore
          // return {ok}
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
  }
  res.status(500).send();
});

app.post('/strava/webhook', async (req, res) => {
  const data = req.body;
  res.send();
  if (data.object_type === 'activity' && data.aspect_type === 'create') {
    const athleteId = data.owner_id.toString();
    const activityId = data.object_id;

    let user;
    try {
      user = await UserModel.findOne({strava_athlete_id: athleteId});
      const stravaClient = new strava.client(user.strava_access_token);
      const activity = await stravaClient.activities.get({id: activityId});
      await postToWebhook({
        username: user.discord_username,
        avatar_url: user.strava_athlete_profile_picture,
        embeds: [
          {
            title: activity.name,
            url: `https://www.strava.com/activities/${activity.id}`,
            description: activity.description,
            color: 12221789,
            timestamp: activity.start_date_local,
            author: {
              name: user.discord_username,
              icon_url: user.strava_athlete_profile_picture,
            },
          },
        ],
      });
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

const onPublishedMessage = () => {};

// Set our GCF handler to our Express app.
exports.distrava = app;
