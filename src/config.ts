export const config = {
  strava: {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    redirect_uri:
      'https://karthikb351-distrava-gw7vqpxh9j44-8080.githubpreview.dev/strava/redirect',
  },
  discord: {
    application_id: process.env.DISCORD_APPLICATION_ID,
    public_key: process.env.DISCORD_PUBLIC_KEY,
  },
};
