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
    interaction_topic: process.env.GOOGLE_PUBSUB_INTERACTION_TOPIC,
    strava_webhook_topic: process.env.GOOGLE_PUBSUB_STRAVA_WEBHOOK_TOPIC,
  },
  mapbox: {
    mapbox_static_maps_access_token:
      process.env.MAPBOX_STATIC_MAPS_ACCESS_TOKEN,
  },
  environment: process.env.ENVIRONMENT || 'staging',
  signing_secret: process.env.SIGNING_SECRET,
};
