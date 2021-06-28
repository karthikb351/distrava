const { Client } = require("discord-slash-commands-client");
// TypeScript: import { Client } from "discord-slash-commands-client";

const client = new Client(
  process.env.DISCORD_BOT_TOKEN,
  process.env.DISCORD_BOT_USERID
);

const guildId = '859109754664124436'; // Distrava Test Server


// will create a new command and log its data. If a command with this name already exist will that be overwritten.
client
  .createCommand({
    name: 'connect',
    description: 'Connect your strava account',
  }, guildId)
  .then(console.log)
  .catch(console.error);


client
  .createCommand({
    name: 'get_last_activity',
    description: 'Get a summary of the last public activity from your strava profile',
  }, guildId)
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