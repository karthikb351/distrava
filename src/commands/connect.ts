import {DistravaCommand} from '.';
import {config} from '../config';
import {encryptString} from '../lib';
import {UserModel} from '../models/user';
import {DiscordInteractionResponse} from '../types';
import {logger} from '../logger';

class ConnectCommand implements DistravaCommand {
  static constructConnectURI = (
    discordUserId: string,
    interaction_token: string
  ): string => {
    const signed_state = JSON.stringify(
      encryptString(
        JSON.stringify({
          user_id: discordUserId,
          interaction_token: interaction_token,
          timestamp: new Date().getTime(),
        })
      )
    );
    return `https://www.strava.com/oauth/authorize?client_id=${config.strava.client_id}&response_type=code&redirect_uri=${config.strava.redirect_uri}&approval_prompt=force&scope=read,activity:read&state=${signed_state}`;
  };
  async prerequisite(interaction: any): Promise<{check: boolean; data: any}> {
    const userId = interaction.member.user.id;
    let user;
    try {
      user = await UserModel.findOne({discord_user_id: userId});
    } catch (e) {
      logger.log('No user found, creating a new one');
    }
    if (!user) {
      user = new UserModel({
        discord_user_id: userId,
        discord_username: interaction.member.user.username,
      });
      await user.save();
    }
    return {
      check: true,
      data: user,
    };
  }
  async exec(interaction: any, user: any): Promise<DiscordInteractionResponse> {
    return {
      content: `Connect your strava account here: ${ConnectCommand.constructConnectURI(
        user.discord_user_id,
        interaction.token
      )}`,
    };
  }
  async sideeffect(interaction: any, user: any): Promise<void> {
    return Promise.resolve();
  }
}

export const connectCommand = new ConnectCommand();
