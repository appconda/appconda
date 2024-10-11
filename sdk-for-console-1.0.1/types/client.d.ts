import { Models } from './models';
/**
 * Payload type representing a key-value pair with string keys and any values.
 */
declare type Payload = {
    [key: string]: any;
};
/**
 * Headers type representing a key-value pair with string keys and string values.
 */
declare type Headers = {
    [key: string]: string;
};
/**
 * Realtime event response structure with generic payload type.
 */
declare type RealtimeResponseEvent<T extends unknown> = {
    /**
     * List of event names associated with the response.
     */
    events: string[];
    /**
     * List of channel names associated with the response.
     */
    channels: string[];
    /**
     * Timestamp indicating the time of the event.
     */
    timestamp: number;
    /**
     * Payload containing event-specific data.
     */
    payload: T;
};
/**
 * Type representing upload progress information.
 */
declare type UploadProgress = {
    /**
     * Identifier for the upload progress.
     */
    $id: string;
    /**
     * Current progress of the upload (in percentage).
     */
    progress: number;
    /**
     * Total size uploaded (in bytes) during the upload process.
     */
    sizeUploaded: number;
    /**
     * Total number of chunks that need to be uploaded.
     */
    chunksTotal: number;
    /**
     * Number of chunks that have been successfully uploaded.
     */
    chunksUploaded: number;
};
/**
 * Exception thrown by the  package
 */
declare class AppwriteException extends Error {
    /**
     * The error code associated with the exception.
     */
    code: number;
    /**
     * The response string associated with the exception.
     */
    response: string;
    /**
     * Error type.
     * See [Error Types](https://appconda.io/docs/response-codes#errorTypes) for more information.
     */
    type: string;
    /**
     * Initializes a Appconda Exception.
     *
     * @param {string} message - The error message.
     * @param {number} code - The error code. Default is 0.
     * @param {string} type - The error type. Default is an empty string.
     * @param {string} response - The response string. Default is an empty string.
     */
    constructor(message: string, code?: number, type?: string, response?: string);
}
/**
 * Client that handles requests to Appconda
 */
declare class Client {
    static CHUNK_SIZE: number;
    /**
     * Holds configuration such as project.
     */
    config: {
        endpoint: string;
        endpointRealtime: string;
        project: string;
        key: string;
        jwt: string;
        locale: string;
        mode: string;
    };
    /**
     * Custom headers for API requests.
     */
    headers: Headers;
    /**
     * Set Endpoint
     *
     * Your project endpoint
     *
     * @param {string} endpoint
     *
     * @returns {this}
     */
    setEndpoint(endpoint: string): this;
    /**
     * Set Realtime Endpoint
     *
     * @param {string} endpointRealtime
     *
     * @returns {this}
     */
    setEndpointRealtime(endpointRealtime: string): this;
    /**
     * Set Project
     *
     * Your project ID
     *
     * @param value string
     *
     * @return {this}
     */
    setProject(value: string): this;
    /**
     * Set Key
     *
     * Your secret API key
     *
     * @param value string
     *
     * @return {this}
     */
    setKey(value: string): this;
    /**
     * Set JWT
     *
     * Your secret JSON Web Token
     *
     * @param value string
     *
     * @return {this}
     */
    setJWT(value: string): this;
    /**
     * Set Locale
     *
     * @param value string
     *
     * @return {this}
     */
    setLocale(value: string): this;
    /**
     * Set Mode
     *
     * @param value string
     *
     * @return {this}
     */
    setMode(value: string): this;
    private realtime;
    /**
     * Subscribes to Appconda events and passes you the payload in realtime.
     *
     * @param {string|string[]} channels
     * Channel to subscribe - pass a single channel as a string or multiple with an array of strings.
     *
     * Possible channels are:
     * - account
     * - collections
     * - collections.[ID]
     * - collections.[ID].documents
     * - documents
     * - documents.[ID]
     * - files
     * - files.[ID]
     * - executions
     * - executions.[ID]
     * - functions.[ID]
     * - teams
     * - teams.[ID]
     * - memberships
     * - memberships.[ID]
     * @param {(payload: RealtimeMessage) => void} callback Is called on every realtime update.
     * @returns {() => void} Unsubscribes from events.
     */
    subscribe<T extends unknown>(channels: string | string[], callback: (payload: RealtimeResponseEvent<T>) => void): () => void;
    prepareRequest(method: string, url: URL, headers?: Headers, params?: Payload): {
        uri: string;
        options: RequestInit;
    };
    chunkedUpload(method: string, url: URL, headers: Headers | undefined, originalPayload: Payload | undefined, onProgress: (progress: UploadProgress) => void): Promise<any>;
    call(method: string, url: URL, headers?: Headers, params?: Payload, responseType?: string): Promise<any>;
    static flatten(data: Payload, prefix?: string): Payload;
}
export { Client, AppwriteException };
export { Query } from './query';
export type { Models, Payload, UploadProgress };
export type { RealtimeResponseEvent };
export type { QueryTypes, QueryTypesList } from './query';
