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
- [ ] Figure out how to query datastore by both discord user id and strava athlete id.
- [ ] Add command to subscribe to channel
- [ ] Add command to unsubscribe to channel
- [ ] Create a datamodel for webhooks
- [ ] Use a ORM for datastore operations
