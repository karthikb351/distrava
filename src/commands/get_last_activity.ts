import {DistravaCommand} from '.';
import {getDiscordEmbedForActivity} from '../lib';
import {StravaUserClient} from '../strava';
import {DiscordInteractionResponse} from '../types';
import {doesDiscordUserExist} from '../util';

class GetLastActivityCommand implements DistravaCommand {
  async prerequisite(interaction: any): Promise<{check: boolean; data: any}> {
    const user = await doesDiscordUserExist(interaction.member.user.id);

    if (!user || !user.strava_refresh_token || !user.strava_access_token) {
      return {
        check: false,
        data: {
          content:
            'Whoops. You need to connect your Strava account first. Use the /connect command.',
        },
      };
    } else {
      return {
        check: true,
        data: user,
      };
    }
  }

  async exec(interaction: any, user: any): Promise<DiscordInteractionResponse> {
    const stravaClient = new StravaUserClient(user);
    const data = await stravaClient.getLastActivity();
    if (data && data.length !== 1) {
      return {
        content: 'No recent activities to show :(',
      };
    }
    const activity = await stravaClient.getActivityById(data[0].id);

    return {
      embeds: [getDiscordEmbedForActivity(user, activity)],
    };
  }
  async sideeffect(interaction: any, user: any): Promise<void> {
    return Promise.resolve();
  }
}

export const getLastActivityCommand = new GetLastActivityCommand();
