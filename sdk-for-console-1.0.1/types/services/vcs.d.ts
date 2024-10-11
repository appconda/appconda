import { Client } from '../client';
import type { Models } from '../models';
export declare class Vcs {
    client: Client;
    constructor(client: Client);
    /**
     * List Repositories
     *
     *
     * @param {string} installationId
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProviderRepositoryList>}
     */
    listRepositories(installationId: string, search?: string): Promise<Models.ProviderRepositoryList>;
    /**
     * Create repository
     *
     *
     * @param {string} installationId
     * @param {string} name
     * @param {boolean} xprivate
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProviderRepository>}
     */
    createRepository(installationId: string, name: string, xprivate: boolean): Promise<Models.ProviderRepository>;
    /**
     * Get repository
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProviderRepository>}
     */
    getRepository(installationId: string, providerRepositoryId: string): Promise<Models.ProviderRepository>;
    /**
     * List Repository Branches
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @throws {AppwriteException}
     * @returns {Promise<Models.BranchList>}
     */
    listRepositoryBranches(installationId: string, providerRepositoryId: string): Promise<Models.BranchList>;
    /**
     * Get files and directories of a VCS repository
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerRootDirectory
     * @throws {AppwriteException}
     * @returns {Promise<Models.VcsContentList>}
     */
    getRepositoryContents(installationId: string, providerRepositoryId: string, providerRootDirectory?: string): Promise<Models.VcsContentList>;
    /**
     * Detect runtime settings from source code
     *
     *
     * @param {string} installationId
     * @param {string} providerRepositoryId
     * @param {string} providerRootDirectory
     * @throws {AppwriteException}
     * @returns {Promise<Models.Detection>}
     */
    createRepositoryDetection(installationId: string, providerRepositoryId: string, providerRootDirectory?: string): Promise<Models.Detection>;
    /**
     * Authorize external deployment
     *
     *
     * @param {string} installationId
     * @param {string} repositoryId
     * @param {string} providerPullRequestId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    updateExternalDeployments(installationId: string, repositoryId: string, providerPullRequestId: string): Promise<{}>;
    /**
     * List installations
     *
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.InstallationList>}
     */
    listInstallations(queries?: string[], search?: string): Promise<Models.InstallationList>;
    /**
     * Get installation
     *
     *
     * @param {string} installationId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Installation>}
     */
    getInstallation(installationId: string): Promise<Models.Installation>;
    /**
     * Delete Installation
     *
     *
     * @param {string} installationId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteInstallation(installationId: string): Promise<{}>;
}
