import { Client, Proxy,  } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const proxy = new Proxy(client);

const result = await proxy.createRule(
    '', // domain
    .Api, // resourceType
    '<RESOURCE_ID>' // resourceId (optional)
);

console.log(result);
