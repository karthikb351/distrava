/* eslint-disable node/no-unpublished-require */
/* eslint-disable no-console */
const {Client} = require('discord-slash-commands-client');
// TypeScript: import { Client } from "discord-slash-commands-client";

const client = new Client(
  process.env.DISCORD_BOT_TOKEN,
  process.env.DISCORD_APPLICATION_ID
);

const guildId = process.env.DISCORD_TEST_GUILD_ID; // Distrava Test Server

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

(async () => {
  try {
    // will create a new command and log its data. If a command with this name already exist will that be overwritten.
    await client
      .createCommand(
        {
          name: 'connect',
          description: 'Connect your strava account',
        },
        guildId
      )
      .then(console.log)
      .catch(console.error);
    await sleep(3000);
    await client
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
    await sleep(3000);

    await client
      .createCommand(
        {
          name: 'subscribe',
          description: 'Auto-post your Strava activities to this channel',
        },
        guildId
      )
      .then(console.log)
      .catch(console.error);
    await sleep(3000);

    await client
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
    await sleep(3000);

    await client
      .createCommand(
        {
          name: 'remove_subscriptions',
          description: 'Removes all subscriptions for this channel',
        },
        guildId
      )
      .then(console.log)
      .catch(console.error);
    await sleep(3000);

    await client
      .createCommand(
        {
          name: 'unsubscribe',
          description:
            'Stop auto-posting your Strava activities to this channel',
        },
        guildId
      )
      .then(console.log)
      .catch(console.error);
    // // will edit the details of a command.
    // await client
    //   .editCommand(
    //     { name: "new command name", description: "new command description" },
    //     "id of the command you wish to edit"
    //   )
    //   .then(console.log)
    //   .catch(console.error);

    // will delete a command
    // await client
    //   .deleteCommand('825802089057091625')
    //   .then(console.log)
    //   .catch(console.error);
  } catch (e) {
    // Deal with the fact the chain failed
  }
})();
