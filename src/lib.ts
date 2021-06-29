const axios = require('axios');
import { config } from './config';

export const responseToInteraction = (interaction_token: string, response: any) => {
    return axios.patch(
        `https://discord.com/api/v8/webhooks/${config.discord.application_id}/${interaction_token}/messages/@original`, response)
}

export const postToWebhook = (response: any) => {
    return axios.post('https://discord.com/api/webhooks/859485897539321898/NBSPsvTXjkOB_sDNOZoPET5tcHbrD216Z49T8Nou685GfhAoDqAgH_HhOcRYenU4GwtB',
        response)
}