import { Client, Messaging } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const messaging = new Messaging(client);

const result = await messaging.createSubscriber(
    '<TOPIC_ID>', // topicId
    '<SUBSCRIBER_ID>', // subscriberId
    '<TARGET_ID>' // targetId
);

console.log(result);