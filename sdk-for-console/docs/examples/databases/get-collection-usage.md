import { Client, Databases, DatabaseUsageRange } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const databases = new Databases(client);

const result = await databases.getCollectionUsage(
    '<DATABASE_ID>', // databaseId
    '<COLLECTION_ID>', // collectionId
    DatabaseUsageRange.TwentyFourHours // range (optional)
);

console.log(result);