const axios = require('axios');
import {config} from './config';
import {WebhookEmbed} from './types';
import {logger} from './logger';

// Imports the Google Cloud client library
const {Datastore} = require('@google-cloud/datastore');

const {Gstore} = require('gstore-node');

const {PubSub} = require('@google-cloud/pubsub');

const crypto = require('crypto');

export const kind = 'User';

// Creates a client
export const datastore = new Datastore({namespace: config.environment});

export const gstore = new Gstore();

export const pubSubClient = new PubSub();

export const publishInteractionMessage = (interaction: any) => {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(JSON.stringify(interaction));
  return pubSubClient
    .topic(config.google.interaction_topic)
    .publish(dataBuffer);
};

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

export const getMapImageForPolyline = (encodedPolyline: string) => {
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/path-5+f44-0.7(${encodeURIComponent(
    encodedPolyline
  )})/auto/500x500?access_token=${
    config.mapbox.mapbox_static_maps_access_token
  }`;
};

export const constructWebhookMessageForActivity = (
  user: any,
  activity: any
) => {
  const result: WebhookEmbed = {
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

  if (activity?.map?.summary_polyline) {
    result.embeds[0].image = {
      url: getMapImageForPolyline(activity.map.summary_polyline),
    };
  }
  const fields: WebhookEmbed['embeds'][0]['fields'] = [];

  if (activity?.distance) {
    fields.push({
      name: 'Distance(kms)',
      value: (activity.distance / 1000).toFixed(2),
      inline: true,
    });
  }
  if (activity?.moving_time) {
    fields.push({
      name: 'Moving Time(mins)',
      value: `${Math.floor(activity.moving_time / 60)}:${
        activity.moving_time % 60
      }`,
      inline: true,
    });
  }
  if (activity?.total_elevation_gain) {
    fields.push({
      name: 'Elevation Gain(meters)',
      value: activity.total_elevation_gain.toFixed(2),
      inline: true,
    });
  }
  if (fields.length > 0) {
    result.embeds[0].fields = fields;
  }
  return result;
};

const permissions = {
  CREATE_INSTANT_INVITE: 1,
  KICK_MEMBERS: 2,
  BAN_MEMBERS: 4,
  ADMINISTRATOR: 8,
  MANAGE_CHANNELS: 16,
  MANAGE_GUILD: 32,
  ADD_REACTIONS: 64,
  VIEW_AUDIT_LOG: 128,
  PRIORITY_SPEAKER: 256,
  VIEW_CHANNEL: 1024,
  READ_MESSAGES: 1024,
  SEND_MESSAGES: 2048,
  SEND_TTS_MESSAGES: 4096,
  MANAGE_MESSAGES: 8192,
  EMBED_LINKS: 16384,
  ATTACH_FILES: 32768,
  READ_MESSAGE_HISTORY: 65536,
  MENTION_EVERYONE: 131072,
  EXTERNAL_EMOJIS: 262144,
  USE_EXTERNAL_EMOJIS: 262144,
  CONNECT: 1048576,
  SPEAK: 2097152,
  MUTE_MEMBERS: 4194304,
  DEAFEN_MEMBERS: 8388608,
  MOVE_MEMBERS: 16777216,
  USE_VAD: 33554432,
  CHANGE_NICKNAME: 67108864,
  MANAGE_NICKNAMES: 134217728,
  MANAGE_ROLES: 268435456,
  MANAGE_ROLES_OR_PERMISSIONS: 268435456,
  MANAGE_WEBHOOKS: 536870912,
  MANAGE_EMOJIS: 1073741824,
};

export const hasPermission = (permission: number, permissionKey) => {
  return permission & permissions[permissionKey];
};

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
    logger.error(e);
    validated = false;
  }
  return validated;
};

export const encryptString = text => {
  const secretKey = config.signing_secret;
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
};

export const decryptString = hash => {
  const decipher = crypto.createDecipheriv(
    'aes-256-ctr',
    config.signing_secret,
    Buffer.from(hash.iv, 'hex')
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
};
