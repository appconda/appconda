import { Client, Projects, EmailTemplateType, EmailTemplateLocale } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const projects = new Projects(client);

const result = await projects.deleteEmailTemplate(
    '<PROJECT_ID>', // projectId
    EmailTemplateType.Verification, // type
    EmailTemplateLocale.Af // locale
);

console.log(result);