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

export const postToWebhook = (response: any) => {
  return axios.post(
    'https://discord.com/api/webhooks/859485897539321898/NBSPsvTXjkOB_sDNOZoPET5tcHbrD216Z49T8Nou685GfhAoDqAgH_HhOcRYenU4GwtB',
    response
  );
};
