import {datastore, kind, strava} from '../lib';
import {UserModel} from '../models/user';

export const handleLastActivityCommand = async (interaction: any) => {
  const userId = interaction.member.user.id;

  let user;
  try {
    user = await UserModel.findOne({discord_user_id: userId});
  } catch (e) {}

  if (!user || !user.strava_refresh_token || !user.strava_access_token) {
    return {
      content:
        'Whoops. You need to connect your Strava account first. Use the /connect command.',
    };
  }

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
};
