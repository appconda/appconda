import { Client, Storage, StorageUsageRange } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const storage = new Storage(client);

const result = await storage.getUsage(
    StorageUsageRange.TwentyFourHours // range (optional)
);

console.log(result);
