import { Service } from '../service';
import { AppcondaException, Client, type Payload, UploadProgress } from '../client';
import type { Models } from '../models';

export class Console {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * Get variables
     *
     * Get all Environment Variables that are relevant for the console.
     *
     * @throws {AppcondaException}
     * @returns {Promise<Models.ConsoleVariables>}
     */
    async variables(): Promise<Models.ConsoleVariables> {
        const apiPath = '/console/variables';
        const payload: Payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);

        const apiHeaders: { [header: string]: string } = {
            'content-type': 'application/json',
        }


        return await this.client.call(
            'get',
            uri,
            apiHeaders,
            payload
        );
    }
}
