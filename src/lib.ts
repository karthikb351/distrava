const axios = require('axios');
import {config} from './config';

// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');

const {Gstore} = require('gstore-node');

export const strava = require('strava-v3');

export const kind = 'User';

strava.config({
  ...config.strava,
  access_token: '',
});

// Creates a client
export const datastore = new Datastore();

export const gstore = new Gstore();

gstore.connect(datastore);

export const responseToInteraction = (
  interaction_token: string,
  response: any
) => {
  return axios.patch(
    `https://discord.com/api/v8/webhooks/${config.discord.application_id}/${interaction_token}/messages/@original`,
    response
  );
};

export const parseWebhookUrl = (webhook_url = '') => {
  const regex = /https:\/\/discord\.com\/api\/webhooks\/([0-9]+)\/(.+)/g;
  const matches = regex.exec(webhook_url);
  if (!webhook_url.match(regex) || matches.length < 3) {
    throw Error('Invalid URL');
  }

  return {
    webhook_id: matches[1],
    webhook_token: matches[2],
  };
};

export const postToWebhook = (
  webhook_id: string,
  webhook_token: string,
  response: any
) => {
  return axios.post(
    `https://discord.com/api/webhooks/${webhook_id}/${webhook_token}`,
    response
  );
};

export const constructWebhookMessageForActivity = (
  user: any,
  activity: any
) => {
  return {
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
  };
};
//

export const validateWebhook = async (
  webhook_id: string,
  webhook_token: string
) => {
  let validated;
  try {
    const response = {content: 'Testing if webhook works!'};
    const messageResponse = await axios.post(
      `https://discord.com/api/webhooks/${webhook_id}/${webhook_token}?wait=true`,
      response
    );
    await axios.delete(
      `https://discord.com/api/webhooks/${webhook_id}/${webhook_token}/messages/${messageResponse.data.id}`
    );
    validated = true;
  } catch (e) {
    console.log(e);
    validated = false;
  }
  return validated;
};
