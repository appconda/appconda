import { Client, Users } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const users = new Users(client);

const result = await users.createToken(
    '<USER_ID>', // userId
    4, // length (optional)
    60 // expire (optional)
);

console.log(result);