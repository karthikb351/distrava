export abstract class DistravaCommand {
  abstract handleCommand(res: Express.Response, interaction: any);
  abstract handleInteraction(interaction: any);
  abstract acknowledgeInteraction(ephemeral: boolean);
  abstract validateInput(interaction: any): boolean;
}
