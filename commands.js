const {Client} = require('discord-slash-commands-client');
// TypeScript: import { Client } from "discord-slash-commands-client";

const client = new Client(
  process.env.DISCORD_BOT_TOKEN,
  process.env.DISCORD_APPLICATION_ID
);

const guildId = '859109754664124436'; // Distrava Test Server

// will create a new command and log its data. If a command with this name already exist will that be overwritten.
client
  .createCommand(
    {
      name: 'connect',
      description: 'Connect your strava account',
    },
    guildId
  )
  .then(console.log)
  .catch(console.error);

client
  .createCommand(
    {
      name: 'get_last_activity',
      description:
        'Get a summary of the last public activity from your strava profile',
    },
    guildId
  )
  .then(console.log)
  .catch(console.error);

client
  .createCommand(
    {
      name: 'subscribe',
      description: 'Auto-post your Strava activities to this channel',
    },
    guildId
  )
  .then(console.log)
  .catch(console.error);

client
  .createCommand(
    {
      name: 'setup_subscriptions',
      description:
        'Setup a webhook to allow users to auto-post their Strava activities on this channel',
      options: [
        {
          type: 3,
          name: 'webhook_url',
          description: 'The discord webhook URL to use to post updates',
          required: true,
        },
      ],
    },
    guildId
  )
  .then(console.log)
  .catch(console.error);
client
  .createCommand(
    {
      name: 'remove_subscriptions',
      description: 'Removes all subscriptions for this channel',
    },
    guildId
  )
  .then(console.log)
  .catch(console.error);
client
  .createCommand(
    {
      name: 'unsubscribe',
      description: 'Stop auto-posting your Strava activities to this channel',
    },
    guildId
  )
  .then(console.log)
  .catch(console.error);
// // will edit the details of a command.
// client
//   .editCommand(
//     { name: "new command name", description: "new command description" },
//     "id of the command you wish to edit"
//   )
//   .then(console.log)
//   .catch(console.error);

// will delete a command
// client
//   .deleteCommand('825802089057091625')
//   .then(console.log)
//   .catch(console.error);
