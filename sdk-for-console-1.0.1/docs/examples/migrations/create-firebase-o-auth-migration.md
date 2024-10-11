import { Client, Migrations } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const migrations = new Migrations(client);

const result = await migrations.createFirebaseOAuthMigration(
    [], // resources
    '<PROJECT_ID>' // projectId
);

console.log(result);
