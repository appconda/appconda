import { Client } from '../client';
export declare class Assistant {
    client: Client;
    constructor(client: Client);
    /**
     * Ask Query
     *
     *
     * @param {string} prompt
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    chat(prompt: string): Promise<{}>;
}
