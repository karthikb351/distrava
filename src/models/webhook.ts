import Schema from 'gstore-node/lib/schema';
import {gstore} from '../lib';

/**
 * Create the schema for the Webhook Model
 */
const webhookSchema = new Schema({
  discord_webhook_id: {type: String, required: true},
  discord_channel_id: {type: String, required: true},
  discord_guild_id: {type: String, required: true},
  discord_webhook_token: {type: String, required: true},
});

export const WebhookModel = gstore.model('Webhook', webhookSchema);
