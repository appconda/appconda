import { Client, Users } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const users = new Users(client);

const result = await users.listIdentities(
    [], // queries (optional)
    '<SEARCH>' // search (optional)
);

console.log(result);