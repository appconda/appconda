import { Client, Functions } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const functions = new Functions(client);

const result = functions.getDeploymentDownload(
    '<FUNCTION_ID>', // functionId
    '<DEPLOYMENT_ID>' // deploymentId
);

console.log(result);