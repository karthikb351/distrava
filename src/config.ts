export const config = {
  strava: {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    redirect_uri: process.env.STRAVA_REDIRECT_URI,
  },
  discord: {
    application_id: process.env.DISCORD_APPLICATION_ID,
    public_key: process.env.DISCORD_PUBLIC_KEY,
    bot_token: process.env.DISCORD_BOT_TOKEN,
  },
  google: {
    google_maps_static_api_key: process.env.GOOGLE_MAPS_STATIC_API_KEY,
    interaction_topic: process.env.GOOGLE_PUBSUB_INTERACTION_TOPIC,
  },
  environment: process.env.ENVIRONMENT || 'staging',
};
