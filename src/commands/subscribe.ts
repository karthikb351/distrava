import {parseWebhookUrl} from '../lib';
import {SubscriptionModel} from '../models/subscription';
import {UserModel} from '../models/user';
import {WebhookModel} from '../models/webhook';

export const handleSubscriptionCommand = async (interaction: any) => {
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
    const webhook_url = interaction.data?.options?.filter(
      x => x.name === 'webhook_url'
    )[0]?.value;
    const _webhook = parseWebhookUrl(webhook_url);
    webhook = new WebhookModel({
      discord_channel_id: channelId,
      discord_guild_id: guildId,
      discord_webhook_id: _webhook.webhook_id,
      discord_webhook_token: _webhook.webhook_token,
    });
    webhook = await webhook.save();
  }

  let existingSubscription;
  try {
    existingSubscription = await SubscriptionModel.findOne({
      webhook_id: webhook.entityKey,
      user_id: user.entityKey,
    });
  } catch (e) {}
  if (existingSubscription) {
    return {
      content: 'You are already subscribed.',
    };
  }
  const subscription = new SubscriptionModel({
    webhook_id: webhook.entityKey,
    user_id: user.entityKey,
  });
  await subscription.save();
  console.log(subscription);
  return {
    content:
      'Subscription successful! Go create an activity and you should see it show up here!',
  };
};
