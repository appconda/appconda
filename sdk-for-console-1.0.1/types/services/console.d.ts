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
     * @throws {AppcondaException}
     * @returns {Promise<Models.ConsoleVariables>}
     */
    variables(): Promise<Models.ConsoleVariables>;
}
