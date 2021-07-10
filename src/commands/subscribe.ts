import {DistravaCommand} from '.';
import {logger} from '../logger';
import {SubscriptionModel} from '../models/subscription';
import {WebhookModel} from '../models/webhook';
import {DiscordInteractionResponse} from '../types';
import {doesDiscordUserExist} from '../util';

class SubscribeCommand implements DistravaCommand {
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
    const channelId = interaction.channel_id;

    let webhook;
    try {
      webhook = await WebhookModel.findOne({
        discord_channel_id: channelId,
        //   discord_guild_id: guildId,
      });
    } catch (e) {
      logger.error(e);
    }

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
    } catch (e) {
      logger.error(e);
    }
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
    return {
      content:
        'Subscription successful! Go create an activity and you should see it show up here!',
    };
  }
  async sideeffect(interaction: any, user: any): Promise<void> {
    return;
  }
}

export const subscribeCommand = new SubscribeCommand();
