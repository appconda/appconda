import { Client } from '../client';
import type { Models } from '../models';
import { Name } from '../enums/name';
export declare class Health {
    client: Client;
    constructor(client: Client);
    /**
     * Get HTTP
     *
     * Check the Appconda HTTP server is up and responsive.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    get(): Promise<Models.HealthStatus>;
    /**
     * Get antivirus
     *
     * Check the Appconda Antivirus server is up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthAntivirus>}
     */
    getAntivirus(): Promise<Models.HealthAntivirus>;
    /**
     * Get cache
     *
     * Check the Appconda in-memory cache servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getCache(): Promise<Models.HealthStatus>;
    /**
     * Get the SSL certificate for a domain
     *
     * Get the SSL certificate for a domain
     *
     * @param {string} domain
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthCertificate>}
     */
    getCertificate(domain?: string): Promise<Models.HealthCertificate>;
    /**
     * Get DB
     *
     * Check the Appconda database servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getDB(): Promise<Models.HealthStatus>;
    /**
     * Get pubsub
     *
     * Check the Appconda pub-sub servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getPubSub(): Promise<Models.HealthStatus>;
    /**
     * Get queue
     *
     * Check the Appconda queue messaging servers are up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getQueue(): Promise<Models.HealthStatus>;
    /**
     * Get builds queue
     *
     * Get the number of builds that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueBuilds(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get certificates queue
     *
     * Get the number of certificates that are waiting to be issued against [Letsencrypt](https://letsencrypt.org/) in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueCertificates(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get databases queue
     *
     * Get the number of database changes that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {string} name
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueDatabases(name?: string, threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get deletes queue
     *
     * Get the number of background destructive changes that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueDeletes(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get number of failed queue jobs
     *
     * Returns the amount of failed jobs in a given queue.

     *
     * @param {Name} name
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getFailedJobs(name: Name, threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get functions queue
     *
     * Get the number of function executions that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueFunctions(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get logs queue
     *
     * Get the number of logs that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueLogs(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get mails queue
     *
     * Get the number of mails that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueMails(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get messaging queue
     *
     * Get the number of messages that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueMessaging(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get migrations queue
     *
     * Get the number of migrations that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueMigrations(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get usage queue
     *
     * Get the number of metrics that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueUsage(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get usage dump queue
     *
     * Get the number of projects containing metrics that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueUsageDump(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get webhooks queue
     *
     * Get the number of webhooks that are waiting to be processed in the Appconda internal queue server.
     *
     * @param {number} threshold
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthQueue>}
     */
    getQueueWebhooks(threshold?: number): Promise<Models.HealthQueue>;
    /**
     * Get storage
     *
     * Check the Appconda storage device is up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getStorage(): Promise<Models.HealthStatus>;
    /**
     * Get local storage
     *
     * Check the Appconda local storage device is up and connection is successful.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthStatus>}
     */
    getStorageLocal(): Promise<Models.HealthStatus>;
    /**
     * Get time
     *
     * Check the Appconda server time is synced with Google remote NTP server. We use this technology to smoothly handle leap seconds with no disruptive events. The [Network Time Protocol](https://en.wikipedia.org/wiki/Network_Time_Protocol) (NTP) is used by hundreds of millions of computers and devices to synchronize their clocks over the Internet. If your computer sets its own clock, it likely uses NTP.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.HealthTime>}
     */
    getTime(): Promise<Models.HealthTime>;
}
