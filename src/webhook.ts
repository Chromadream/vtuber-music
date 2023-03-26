import { Webhook } from "discord-webhook-node-data";
import { Entry } from "./db";

const sendWebhook = (client: Webhook, entry: Entry): void => {
    client.setUsername(entry.channelName);
    const message = `New ${entry.contentType}: ${entry.title}. https://www.youtube.com/watch?v=${entry.youtubeID}`;
    console.log(message);
    client.send(message);
}

export {sendWebhook};