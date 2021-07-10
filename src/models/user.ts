import Schema from 'gstore-node/lib/schema';
import {gstore} from '../lib';

/**
 * Create the schema for the User Model
 */
const userSchema = new Schema({
  discord_user_id: {type: String, required: true},
  discord_username: {type: String, required: true, excludeFromIndexes: true},
  discord_profile_picture: {
    type: String,
    required: false,
    excludeFromIndexes: true,
  },
  strava_athlete_id: {type: String, optional: true},
  strava_athlete_profile_picture: {
    type: String,
    optional: true,
    excludeFromIndexes: true,
  },
  strava_access_token_expires_at: {
    type: Number,
    optional: true,
    excludeFromIndexes: true,
  },
  strava_access_token: {type: String, optional: true, excludeFromIndexes: true},
  strava_refresh_token: {
    type: String,
    optional: true,
    excludeFromIndexes: true,
  },
});

export const UserModel = gstore.model('User', userSchema);
