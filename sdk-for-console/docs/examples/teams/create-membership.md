import { Client, Teams } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const teams = new Teams(client);

const result = await teams.createMembership(
    '<TEAM_ID>', // teamId
    [], // roles
    'email@example.com', // email (optional)
    '<USER_ID>', // userId (optional)
    '+12065550100', // phone (optional)
    'https://example.com', // url (optional)
    '<NAME>' // name (optional)
);

console.log(result);