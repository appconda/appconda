import { Client, Account, AuthenticatorType } from "@appconda.io/console";

const client = new Client()
    .setEndpoint('https://cloud.appconda.io/v1') // Your API Endpoint
    .setProject('<YOUR_PROJECT_ID>'); // Your project ID

const account = new Account(client);

const result = await account.createMfaAuthenticator(
    AuthenticatorType.Totp // type
);

console.log(result);
