import { Client, Account, Projects, Teams } from "@appconda/console-sdk";

function getPortAndHostname(urlString: string): { hostname: string; port: string; protocol: string } {
    try {
        const url = new URL(urlString);
        return {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? '443' : '80'), // Default ports if not specified
            protocol: url.protocol
        };
    } catch (error) {
        console.error('Invalid URL:', error);
        return { hostname: '', port: '', protocol: '' };
    }
}

const hostInfo = getPortAndHostname(window.location.href);
console.log(hostInfo);
let client: Client;

if (import.meta.env.MODE === "development") {
    client = new Client()
        .setEndpoint(`http://localhost/v1`) // Your API Endpoint
        .setProject('console');
} else {
    /*   if (hostInfo.port === '80') {
          client = new Client()
          .setEndpoint(`${hostInfo.protocol}://${hostInfo.hostname}/v1`) // Your API Endpoint
          .setProject('console');
      } else { */
    client = new Client()
        .setEndpoint(`${hostInfo.protocol}//${hostInfo.hostname}:${hostInfo.port}/v1`) // Your API Endpoint
        .setProject('console');
    //}
}

export function getClientEndpoint() {
    if (import.meta.env.MODE === "development") {
        return `http://localhost/v1`
    } else {
        return `${hostInfo.protocol}//${hostInfo.hostname}:${hostInfo.port}/v1`
    }
}

export namespace sdk {
    export const account = new Account(client);
    export const team = new Teams(client);
    export const projects = new Projects(client);
}
