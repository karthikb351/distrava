export type DiscordEmbed = {
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
};

export type WebhookEmbed = {
  username: string;
  avatar_url: string;
  embeds?: DiscordEmbed[];
};

export type DiscordSlashCommandInteraction = any;
export type DistravaUser = any;
export type DiscordInteractionResponse = {
  content?: string;
  embeds?: DiscordEmbed[];
};
