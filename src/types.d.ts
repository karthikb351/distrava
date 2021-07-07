export type WebhookEmbed = {
  username: string;
  avatar_url: string;
  embeds: {
    title: string;
    url: string;
    description: string;
    color: number;
    timestamp: string;
    author: {
      name: string;
      icon_url: string;
    };
    image?: {
      url: string;
    };
    fields?: {
      name: string;
      value: string;
      inline?: boolean;
    }[];
  }[];
};

export type DiscordSlashCommandInteraction = any;
