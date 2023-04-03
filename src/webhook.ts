import { Webhook } from "minimal-discord-webhook-node";
import { Entry } from "./db";

const sendWebhook = (client: Webhook, entry: Entry): void => {
    client.setUsername(entry.channelName);
    if (entry.channelProfileImage != null) {
        client.setAvatar(entry.channelProfileImage);
    }
    const message = `New ${entry.contentType}: ${entry.title}. https://www.youtube.com/watch?v=${entry.youtubeID}`;
    console.log(message);
    client.send(message);
}

export {sendWebhook};