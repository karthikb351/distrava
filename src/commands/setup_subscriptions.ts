import {DistravaCommand} from '.';
import {hasPermission, parseWebhookUrl, validateWebhook} from '../lib';
import {WebhookModel} from '../models/webhook';
import {DiscordInteractionResponse} from '../types';
import {logger} from '../logger';

class SetupSubscriptionsCommand implements DistravaCommand {
  async prerequisite(interaction: any): Promise<{check: boolean; data: any}> {
    if (
      !hasPermission(
        Number(interaction.member.permissions),
        'MANAGE_WEBHOOKS'
      ) &&
      !hasPermission(Number(interaction.member.permissions), 'ADMINISTRATOR')
    ) {
      return {
        check: false,
        data: {
          content:
            'You need to have `MANAGE_WEBHOOKS` or `ADMINISTRATOR` permisison to use this command',
        },
      };
    }
    return {
      check: true,
      data: {},
    };
  }
  async exec(interaction: any, user: any): Promise<DiscordInteractionResponse> {
    const channelId = interaction.channel_id;
    const guildId = interaction.guild_id;
    const webhook_url = interaction.data?.options?.filter(
      x => x.name === 'webhook_url'
    )[0]?.value;
    let _webhook;
    try {
      _webhook = parseWebhookUrl(webhook_url);
    } catch (e) {
      return {
        content: "That webhook URL looks incorrect. Are you sure that's right?",
      };
    }
    const validated = await validateWebhook(
      _webhook.webhook_id,
      _webhook.webhook_token
    );
    if (!validated) {
      return {
        content: "That webhook URL looks incorrect. Are you sure that's right?",
      };
    }
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
      webhook = new WebhookModel({
        discord_channel_id: channelId,
        discord_guild_id: guildId,
        discord_webhook_id: _webhook.webhook_id,
        discord_webhook_token: _webhook.webhook_token,
      });
    } else {
      // If there is an existing webhook, we update the webhook configuration
      webhook.discord_webhook_id = _webhook.webhook_id;
      webhook.discord_webhook_token = _webhook.webhook_token;
      logger.info('Existing webhook found, updating to new URL');
    }

    webhook = await webhook.save();

    return {
      content:
        'Subscription successful! Go create an activity and you should see it show up here!',
    };
  }
  async sideeffect(interaction: any, user: any): Promise<void> {
    return Promise.resolve();
  }
}

export const setupSubscriptionsCommand = new SetupSubscriptionsCommand();
