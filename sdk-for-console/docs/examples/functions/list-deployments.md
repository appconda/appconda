import { Client, Functions } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const functions = new Functions(client);

const result = await functions.listDeployments(
    '<FUNCTION_ID>', // functionId
    [], // queries (optional)
    '<SEARCH>' // search (optional)
);

console.log(result);