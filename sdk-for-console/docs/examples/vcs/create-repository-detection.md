import { Client, Vcs } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const vcs = new Vcs(client);

const result = await vcs.createRepositoryDetection(
    '<INSTALLATION_ID>', // installationId
    '<PROVIDER_REPOSITORY_ID>', // providerRepositoryId
    '<PROVIDER_ROOT_DIRECTORY>' // providerRootDirectory (optional)
);

console.log(result);