import {SubscriptionModel} from '../models/subscription';
import {UserModel} from '../models/user';
import {WebhookModel} from '../models/webhook';

export const handleUnsubscribeCommand = async (interaction: any) => {
  const userId = interaction.member.user.id;

  let user;
  try {
    user = await UserModel.findOne({discord_user_id: userId});
  } catch (e) {}

  if (!user || !user.strava_refresh_token || !user.strava_access_token) {
    return {
      content:
        'Whoops. You need to connect your Strava account first. Use the `/connect` command.',
    };
  }

  const channelId = interaction.channel_id;
  const guildId = interaction.guild_id;

  let webhook;
  try {
    webhook = await WebhookModel.findOne({
      discord_channel_id: channelId,
      //   discord_guild_id: guildId,
    });
  } catch (e) {}

  if (!webhook) {
    return {
      content:
        'There is no webhook configured for this channel. Try running `/setup_subscriptions`',
    };
  }

  let existingSubscription;
  try {
    existingSubscription = await SubscriptionModel.findOne({
      webhook_id: webhook.entityKey,
      user_id: user.entityKey,
    });
  } catch (e) {}
  if (!existingSubscription) {
    return {
      content: 'You have not subscribed to this channel.',
    };
  }
  await SubscriptionModel.delete(
    null,
    null,
    null,
    null,
    existingSubscription.entityKey
  );
  return {
    content:
      'You have unsubscribed successfully! Use `/subscribe` to automatically post your activities to this channel',
  };
};