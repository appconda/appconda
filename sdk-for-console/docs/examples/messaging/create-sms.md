import { Client, Messaging } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const messaging = new Messaging(client);

const result = await messaging.createSms(
    '<MESSAGE_ID>', // messageId
    '<CONTENT>', // content
    [], // topics (optional)
    [], // users (optional)
    [], // targets (optional)
    false, // draft (optional)
    '' // scheduledAt (optional)
);

console.log(result);
