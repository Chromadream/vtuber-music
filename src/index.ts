/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

import { Webhook } from "discord-webhook-node-data";
import { diffNewEntries, saveNewEntries } from "./db";
import { getMusic } from "./holodex";
import { sendWebhook } from "./webhook";

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	DB: D1Database;
	DISCORD_WEBHOOK_URL: string;
	HOLODEX_API_KEY: string;
}

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		const [hololive, nijisanji] = await Promise.all([getMusic(env.HOLODEX_API_KEY, "Hololive"), getMusic(env.HOLODEX_API_KEY, "Nijisanji")]);
		const entries = hololive.concat(nijisanji);
		const newEntries = await diffNewEntries(env.DB, entries);
		const client = new Webhook(env.DISCORD_WEBHOOK_URL);
		newEntries.forEach(entry => {
			sendWebhook(client, entry);
		});
		await saveNewEntries(env.DB, newEntries);
	},
};
