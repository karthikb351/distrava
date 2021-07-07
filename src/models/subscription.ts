import Schema from 'gstore-node/lib/schema';
import {gstore} from '../lib';

/**
 * Create the schema for the Subscription Model
 */
const subscriptionSchema = new Schema({
  webhook_id: {type: Schema.Types.Key, ref: 'Webhook', required: true},
  user_id: {type: Schema.Types.Key, ref: 'User', required: true},
});

export const SubscriptionModel = gstore.model(
  'Subscription',
  subscriptionSchema
);
