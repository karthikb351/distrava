const axios = require('axios');
import { config } from './config';

export const responseToInteraction = (interaction_token: string, response: any) => {
    return axios.patch(
        `https://discord.com/api/v8/webhooks/${config.discord.application_id}/${interaction_token}/messages/@original`, response)
}