import { Client, Projects, SmsTemplateType, SmsTemplateLocale } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const projects = new Projects(client);

const result = await projects.deleteSmsTemplate(
    '<PROJECT_ID>', // projectId
    SmsTemplateType.Verification, // type
    SmsTemplateLocale.Af // locale
);

console.log(result);