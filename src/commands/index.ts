import {
  DiscordInteractionResponse,
  DiscordSlashCommandInteraction,
  DistravaUser,
} from '../types';

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
