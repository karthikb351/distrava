import {config} from './config';

const strava = require('strava-v3');

strava.config({
  ...config.strava,
  access_token: '',
});

export class StravaUserClient {
  client: any;
  user: any;
  constructor(user) {
    this.client = new strava.client(user.strava_access_token);
    this.user = user;
  }

  async handleAccessTokenExpiry() {
    if (
      this.user.strava_access_token_expires_at &&
      this.user.strava_access_token_expires_at < new Date().getTime() / 1000
    ) {
      const response = await this.client.oauth.refreshToken(
        this.user.strava_refresh_token
      );
      this.user.strava_refresh_token = response.refresh_token;
      this.user.strava_access_token = response.access_token;
      this.user.strava_access_token_expires_at = response.expires_at;
      await this.user.save();
    }
  }
  async getActivityById(activity_id: string) {
    await this.handleAccessTokenExpiry();
    return await this.client.activities.get({
      id: activity_id,
      include_all_efforts: false,
    });
  }

  async getLastActivity() {
    await this.handleAccessTokenExpiry();
    return await this.client.athlete.listActivities({
      before: Math.floor(new Date().getTime() / 1000),
      per_page: 1,
    });
  }

  async getAthlete() {
    await this.handleAccessTokenExpiry();
    return await this.client.athlete.get();
  }

  static async getToken(code: string) {
    return await strava.oauth.getToken(code);
  }
}
