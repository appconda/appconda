import { Client, Teams } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const teams = new Teams(client);

const result = await teams.create(
    '<TEAM_ID>', // teamId
    '<NAME>', // name
    [] // roles (optional)
);

console.log(result);
