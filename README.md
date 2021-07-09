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
- [x] User Pub/Sub for handling interactions post acknowledgement
- [x] Deploy the app on Cloud Functions
- [x] Setup envs and configs in Dockerfile
- [x] Fix flaky deployment to cloud functions
- [x] Use JWT/encrypted JSON to pass state to Strava OAuth and back
- [x] Setup production App on Strava and Discord
- [x] Add interaction token to state to edit the message once the account has been connected
- [x] Use namespaces with datastore to seperate staging vs prod
- [x] Abstract class for a "command", that has ack, exec, and response functions (ref: http://refactoring.guru/design-patterns/command/typescript/example)
- [ ] Add discord profile picture to user model
- [ ] Fix multiline logs on GCP Logger
- [ ] File issues/open PRs to fix Google's docs on Cloud Functions with Typescript
