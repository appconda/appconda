import { Client, Projects } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const projects = new Projects(client);

const result = await projects.createJWT(
    '<PROJECT_ID>', // projectId
    [], // scopes
    0 // duration (optional)
);

console.log(result);