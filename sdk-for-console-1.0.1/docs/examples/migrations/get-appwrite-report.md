import { Client, Migrations } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const migrations = new Migrations(client);

const result = await migrations.getAppcondaReport(
    [], // resources
    'https://example.com', // endpoint
    '<PROJECT_ID>', // projectID
    '<KEY>' // key
);

console.log(result);
