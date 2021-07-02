import {config} from '../config';
import {datastore, kind} from '../lib';
import {UserModel} from '../models/user';

const constructConnectURI = (discordUserId: string): string => {
  const state = {
    user_id: discordUserId,
  };
  return `https://www.strava.com/oauth/authorize?client_id=${
    config.strava.client_id
  }&response_type=code&redirect_uri=${
    config.strava.redirect_uri
  }&approval_prompt=force&scope=read,activity:read&state=${JSON.stringify(
    state
  )}`;
};

export const handleConnectCommand = async (interaction: any) => {
  const userId = interaction.member.user.id;
  let user;
  try {
    user = await UserModel.findOne({discord_user_id: userId});
  } catch (e) {
    console.log(e);
  }
  if (!user) {
    user = new UserModel({
      discord_user_id: userId,
      discord_username: interaction.member.user.username,
    });
    await user.save();
  }
  return {
    content: `Connect your strava account here: ${constructConnectURI(userId)}`,
  };
};
