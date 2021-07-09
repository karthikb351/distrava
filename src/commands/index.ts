import {
  DiscordInteractionResponse,
  DiscordSlashCommandInteraction,
  DistravaUser,
} from '../types';
import {connectCommand} from './connect';
import {getLastActivityCommand} from './get_last_activity';
import {removeSubscriptionCommand} from './remove_subscription';
import {setupSubscriptionsCommand} from './setup_subscriptions';
import {subscribeCommand} from './subscribe';
import {unsubscribeCommand} from './unsubscribe';
export interface DistravaCommand {
  prerequisite(
    interaction: DiscordSlashCommandInteraction
  ): Promise<{check: boolean; data: DiscordInteractionResponse | DistravaUser}>;
  exec(
    interaction: DiscordSlashCommandInteraction,
    user: DistravaUser
  ): Promise<DiscordInteractionResponse>;
  sideeffect(
    interaction: DiscordSlashCommandInteraction,
    user: DistravaUser
  ): Promise<void>;
}
