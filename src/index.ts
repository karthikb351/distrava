import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import * as express from 'express';
import { config } from './config';
import { postToWebhook, responseToInteraction } from './lib';

const strava = require('strava-v3');


strava.config({
  ...config.strava, access_token: ''
});

// Imports the Google Cloud client library
const { Datastore } = require('@google-cloud/datastore');

// Create an Express object and routes (in order)
const app = express();

// Creates a client
const datastore = new Datastore();

const kind = 'User';

const getAckMessage = (ephemeral: boolean = false) => {
  return {
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `I'm trying :(`,
      flags: ephemeral ? InteractionResponseFlags.EPHEMERAL : undefined
    },
  }
}

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
        default:
          await responseToInteraction(interaction_token, "?");

      }
    } else {
      res.send({
        type: InteractionResponseType.PONG,
      });
    }
  }
);

const handleLastActivityCommand = async (interaction: any) => {

  const userId = interaction.member.user.id;
  const dsKey = datastore.key([kind, userId]);
  const [user] = await datastore.get(dsKey);

  if (!user || !user.strava) {
    return {
      content: `Whoops. You need to connect your strava account first. Use the /connect command.`,
    };
  }

  const stravaClient = new strava.client(user.strava.access_token);
  const data = await stravaClient.athlete.listActivities({ before: Math.floor(new Date().getTime() / 1000), per_page: 1 });
  if (data && data.length != 1) {
    return {
      content: `No recent activities to show :(`
    };
  }
  const activity = await stravaClient.activities.get({
    id: data[0].id,
    include_all_efforts: false,
  });

  return {
    embeds: [{
      title: activity.name,
      description: activity.description,
      url: `https://www.strava.com/activities/${activity.id}`,
      color: 12221789,
      timestamp: activity.start_date_local,
    }]
  };

}

const handleConnectCommand = async (interaction: any) => {

  const userId = interaction.member.user.id;
  const dsKey = datastore.key([kind, userId]);
  const user = {
    key: dsKey,
    data: {
      username: interaction.member.user.username,
    },
  };
  // Saves the entity
  await datastore.save(user);
  console.log(`Saved ${user.key.name}: ${user.data.username}`);
  return {
    content: `Connect your strava account here: ${constructConnectURI(
      userId
    )}`,
  };
}

const constructConnectURI = (discordUserId: string): string => {
  const state = {
    user_id: discordUserId,
  }
  return `https://www.strava.com/oauth/authorize?client_id=${config.strava.client_id}&response_type=code&redirect_uri=${config.strava.redirect_uri}&approval_prompt=force&scope=read,activity:read&state=${JSON.stringify(state)}`
}


app.get('/strava/redirect', async (req, res) => {
  const code = (req.query.code as string) || '';
  const state = JSON.parse((req.query.state as string) || '{}');


  const dsKey = datastore.key([kind, state.user_id]);
  const [user] = await datastore.get(dsKey);

  const response: {
    token_type: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
    access_token: string;
  } = await strava.oauth.getToken(code);


  user.strava = {
    refresh_token: response.refresh_token,
    access_token: response.access_token,
  };
  // Saves the entity
  await datastore.save(user);

  res.send('All good! Your account is connected.');
});


app.get('/strava/webhook', async (req, res) => {
  const data = req.query;
  if (data['hub.mode'] === 'subscribe' && data['hub.verify_token'] === 'somerandomsecret') {
    res.json({
      "hub.challenge": data['hub.challenge']
    })
  }
  res.status(500).send();
});

app.post('/strava/webhook', async (req, res) => {

  const data = req.body;
  res.send();
  if (data.object_type === 'activity' && data.aspect_type === 'create') {
    const athleteId = data.owner_id;
    const activityId = data.object_id;
    await postToWebhook({
      username: "Distrava Update!",
      embeds: [{
        title: `New activity posted for athlete id: ${athleteId}!`,
        url: `https://www.strava.com/activities/${activityId}`,
      }]

    })
    // Lookup datastore via strava athlete ID
    // Lookup which channel to post for that athlete
    // Find all webhooks to post to for this athlete, and push them to pub/sub
    // end
  }




})


const onPublishedMessage = () => {

}


// Set our GCF handler to our Express app.
exports.distrava = app;
