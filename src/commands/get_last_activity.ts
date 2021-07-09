import {DistravaCommand} from '.';
import {strava} from '../lib';
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
    const stravaClient = new strava.client(user.strava_access_token);
    const data = await stravaClient.athlete.listActivities({
      before: Math.floor(new Date().getTime() / 1000),
      per_page: 1,
    });
    if (data && data.length !== 1) {
      return {
        content: 'No recent activities to show :(',
      };
    }
    const activity = await stravaClient.activities.get({
      id: data[0].id,
      include_all_efforts: false,
    });

    return {
      embeds: [
        {
          title: activity.name,
          description: activity.description,
          url: `https://www.strava.com/activities/${activity.id}`,
          color: 12221789,
          timestamp: activity.start_date_local,
          author: {
            name: user.discord_username,
            icon_url: user.strava_athlete_profile_picture,
          },
        },
      ],
    };
  }
  async sideeffect(interaction: any, user: any): Promise<void> {
    return Promise.resolve();
  }
}

export const getLastActivityCommand = new GetLastActivityCommand();
