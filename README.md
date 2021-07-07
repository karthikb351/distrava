## Distrava

### How to setup

This project requires `node12` and `gcloud` cli to be installed.

To install dependencies, run `npm i`
To start the app locally run `npm run start`
To deploy the app on google cloud functions, run `npm run deploy`.

## To Do

- [x] Connected to Discord's slash commands
- [x] Configured Strava client id + secret
- [x] Implement OAuth flow
- [x] Persist Refresh token in our datastore
- [x] Fetch strava activity using token from datastore
- [x] Get richer activity data for embed
- [x] Strava webhook endpoint
- [x] Use a ORM for datastore operations
- [x] Figure out how to query datastore by both discord user id and strava athlete id.
- [x] Add command to subscribe to channel
- [x] Create a datamodel for webhooks
- [x] Validate webhook URL by creating a message and immediately deleting it
- [x] Figure out how to query by property which is a key
- [x] Embed map of activity (if available)
- [x] Add command to unsubscribe to channel
- [x] Add command `/setup_subscriptions` to connect webhooks
- [x] Add command `/remove_subscriptions` to connect webhooks
- [x] Limit `/setup_subscriptions` and `/remove_subscriptions` to only admins
- [ ] Abstract class for a "command", that has ack, exec, and response functions (ref: https://refactoring.guru/design-patterns/command/typescript/example)
- [ ] Explore Pub/Sub for handling interactions post acknowledgement
- [ ] Add discord profile picture to user model
- [ ] Setup envs and configs in Dockerfile
- [ ] Deploy the app on Cloud Functions
- [ ] Setup production App on Strava and Discord
- [ ] Fix multiline logs on GCP Logger
