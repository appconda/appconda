import { Client, Functions } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const functions = new Functions(client);

const result = await functions.getVariable(
    '<FUNCTION_ID>', // functionId
    '<VARIABLE_ID>' // variableId
);

console.log(result);
