import { Client, Users } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const users = new Users(client);

const result = await users.updateEmailVerification(
    '<USER_ID>', // userId
    false // emailVerification
);

console.log(result);
