import { Client, Projects } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const projects = new Projects(client);

const result = await projects.createKey(
    '<PROJECT_ID>', // projectId
    '<NAME>', // name
    [], // scopes
    '' // expire (optional)
);

console.log(result);