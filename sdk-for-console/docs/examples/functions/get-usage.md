import { Client, Functions, FunctionUsageRange } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const functions = new Functions(client);

const result = await functions.getUsage(
    FunctionUsageRange.TwentyFourHours // range (optional)
);

console.log(result);
