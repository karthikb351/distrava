import {DistravaCommand} from '.';
import {config} from '../config';
import {encryptString} from '../lib';
import {UserModel} from '../models/user';

const constructConnectURI = (
  discordUserId: string,
  interaction_token: string
): string => {
  const signed_state = JSON.stringify(
    encryptString(
      JSON.stringify({
        user_id: discordUserId,
        interaction_token: interaction_token,
      })
    )
  );
  return `https://www.strava.com/oauth/authorize?client_id=${config.strava.client_id}&response_type=code&redirect_uri=${config.strava.redirect_uri}&approval_prompt=force&scope=read,activity:read&state=${signed_state}`;
};

export const handleConnectCommand = async (interaction: any) => {
  const userId = interaction.member.user.id;
  let user;
  try {
    user = await UserModel.findOne({discord_user_id: userId});
  } catch (e) {
    console.log('No user found, creating a new one');
  }
  if (!user) {
    user = new UserModel({
      discord_user_id: userId,
      discord_username: interaction.member.user.username,
    });
    await user.save();
  }
  return {
    content: `Connect your strava account here: ${constructConnectURI(
      userId,
      interaction.token
    )}`,
  };
};
