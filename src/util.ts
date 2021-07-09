import {UserModel} from './models/user';

export const doesDiscordUserExist = async (discord_user_id: string) => {
  try {
    return await UserModel.findOne({discord_user_id: discord_user_id});
  } catch (e) {
    return false;
  }
};
