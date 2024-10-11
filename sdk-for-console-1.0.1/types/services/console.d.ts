import { Client } from '../client';
import type { Models } from '../models';
export declare class Console {
    client: Client;
    constructor(client: Client);
    /**
     * Get variables
     *
     * Get all Environment Variables that are relevant for the console.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.ConsoleVariables>}
     */
    variables(): Promise<Models.ConsoleVariables>;
}
