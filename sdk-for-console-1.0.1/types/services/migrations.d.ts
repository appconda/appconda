import { Client } from '../client';
import type { Models } from '../models';
export declare class Migrations {
    client: Client;
    constructor(client: Client);
    /**
     * List Migrations
     *
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationList>}
     */
    list(queries?: string[], search?: string): Promise<Models.MigrationList>;
    /**
     * Migrate Appconda Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} projectId
     * @param {string} apiKey
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createAppwriteMigration(resources: string[], endpoint: string, projectId: string, apiKey: string): Promise<Models.Migration>;
    /**
     * Generate a report on Appconda Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} projectID
     * @param {string} key
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getAppwriteReport(resources: string[], endpoint: string, projectID: string, key: string): Promise<Models.MigrationReport>;
    /**
     * Migrate Firebase Data (Service Account)
     *
     *
     * @param {string[]} resources
     * @param {string} serviceAccount
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createFirebaseMigration(resources: string[], serviceAccount: string): Promise<Models.Migration>;
    /**
     * Revoke Appconda&#039;s authorization to access Firebase Projects
     *
     *
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteFirebaseAuth(): Promise<{}>;
    /**
     * Migrate Firebase Data (OAuth)
     *
     *
     * @param {string[]} resources
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createFirebaseOAuthMigration(resources: string[], projectId: string): Promise<Models.Migration>;
    /**
     * List Firebase Projects
     *
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.FirebaseProjectList>}
     */
    listFirebaseProjects(): Promise<Models.FirebaseProjectList>;
    /**
     * Generate a report on Firebase Data
     *
     *
     * @param {string[]} resources
     * @param {string} serviceAccount
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getFirebaseReport(resources: string[], serviceAccount: string): Promise<Models.MigrationReport>;
    /**
     * Generate a report on Firebase Data using OAuth
     *
     *
     * @param {string[]} resources
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getFirebaseReportOAuth(resources: string[], projectId: string): Promise<Models.MigrationReport>;
    /**
     * Migrate NHost Data
     *
     *
     * @param {string[]} resources
     * @param {string} subdomain
     * @param {string} region
     * @param {string} adminSecret
     * @param {string} database
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createNHostMigration(resources: string[], subdomain: string, region: string, adminSecret: string, database: string, username: string, password: string, port?: number): Promise<Models.Migration>;
    /**
     * Generate a report on NHost Data
     *
     *
     * @param {string[]} resources
     * @param {string} subdomain
     * @param {string} region
     * @param {string} adminSecret
     * @param {string} database
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getNHostReport(resources: string[], subdomain: string, region: string, adminSecret: string, database: string, username: string, password: string, port?: number): Promise<Models.MigrationReport>;
    /**
     * Migrate Supabase Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} apiKey
     * @param {string} databaseHost
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    createSupabaseMigration(resources: string[], endpoint: string, apiKey: string, databaseHost: string, username: string, password: string, port?: number): Promise<Models.Migration>;
    /**
     * Generate a report on Supabase Data
     *
     *
     * @param {string[]} resources
     * @param {string} endpoint
     * @param {string} apiKey
     * @param {string} databaseHost
     * @param {string} username
     * @param {string} password
     * @param {number} port
     * @throws {AppwriteException}
     * @returns {Promise<Models.MigrationReport>}
     */
    getSupabaseReport(resources: string[], endpoint: string, apiKey: string, databaseHost: string, username: string, password: string, port?: number): Promise<Models.MigrationReport>;
    /**
     * Get Migration
     *
     *
     * @param {string} migrationId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    get(migrationId: string): Promise<Models.Migration>;
    /**
     * Retry Migration
     *
     *
     * @param {string} migrationId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Migration>}
     */
    retry(migrationId: string): Promise<Models.Migration>;
    /**
     * Delete Migration
     *
     *
     * @param {string} migrationId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(migrationId: string): Promise<{}>;
}
