import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import * as express from 'express';
import {config} from './config';

const strava = require('strava-v3');


strava.config({...config, access_token: ''});

// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');

// Create an Express object and routes (in order)
const app = express();

// Creates a client
const datastore = new Datastore();

const kind = 'User';

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
      switch(interaction.data.name) {
        case 'connect':
          response = await handleConnectCommand(interaction);
          res.send(response);
          break;
        case 'get_last_activity':
          response = await handleLastActivityCommand(interaction);
          res.send(response);
          break;
        default:
          res.send("?");

      }
    } else {
      res.send({
        type: InteractionResponseType.PONG,
      });
    }
  }
);

const handleLastActivityCommand = async(interaction: any) => {

  const userId = interaction.member.user.id;
  const dsKey = datastore.key([kind, userId]);
  const [user] = await datastore.get(dsKey);

  if (!user || !user.strava) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Whoops. You need to connect your strava account first. Use the /connect command.`,
        flags: InteractionResponseFlags.EPHEMERAL
      },
    };
  }

  const stravaClient = new strava.client(user.strava.access_token);
  let data = await stravaClient.athlete.listActivities({before: 1624903273, per_page: 1});
  if (data && data.length != 1) {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `No recent activities to show :(`,
        flags: InteractionResponseFlags.EPHEMERAL
      },
    };
  }
  const activity = data[0];
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `You have ${data.length} activities`,
      embeds: [{
        title: activity.name,
        color: 12221789,
        timestamp: activity.start_date_local,
      }]
    },
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
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Connect your strava account here: ${constructConnectURI(
          userId
        )}`,
        flags: InteractionResponseFlags.EPHEMERAL
      },
    };
}

const constructConnectURI = (discordUserId: string): string => {
  const state = {
    user_id: discordUserId,
  }
  return `https://www.strava.com/oauth/authorize?client_id=${config.client_id}&response_type=code&redirect_uri=${config.redirect_uri}&approval_prompt=force&scope=read,activity:read&state=${JSON.stringify(state)}`
}


app.get('/strava/redirect', async (req, res) => {
  const code = (req.query.code as string) || '';
  const state = JSON.parse((req.query.state as string)|| '{}');


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
      refresh_token:  response.refresh_token,
      access_token: response.access_token,
    };
  // Saves the entity
  await datastore.save(user);

  res.send('All good! Your account is connected.');
});

// Set our GCF handler to our Express app.
exports.distrava = app;
