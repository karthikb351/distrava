import {hasPermission} from '../lib';
import {SubscriptionModel} from '../models/subscription';
import {WebhookModel} from '../models/webhook';

export const handleRemoveSubscriptionCommand = async (interaction: any) => {
  const channelId = interaction.channel_id;
  const guildId = interaction.guild_id;

  if (
    !hasPermission(Number(interaction.member.permissions), 'MANAGE_WEBHOOKS') &&
    !hasPermission(Number(interaction.member.permissions), 'ADMINISTRATOR')
  ) {
    return {
      content:
        'You need to have `MANAGE_WEBHOOKS` or `ADMINISTRATOR` permisison to use this command',
    };
  }

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
        "This channel hasn't been setup yet. Did you mean `/setup_subscriptions`",
    };
  }

  // List of subscriptions for a given user
  const subscriptions = await SubscriptionModel.query()
    .filter('webhook_id', webhook.entityKey)
    .run({format: 'ENTITY'});

  const subscriptionKeys = subscriptions.entities.map(subscription => {
    return subscription.entityKey;
  });
  if (subscriptionKeys.length > 0) {
    await SubscriptionModel.delete(null, null, null, null, subscriptionKeys);
  }
  await WebhookModel.delete(null, null, null, null, webhook.entityKey);

  return {
    content: 'All subscriptions for this channel have been removed',
  };
};
