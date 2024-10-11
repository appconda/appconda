import { Client } from '../client';
import type { Models } from '../models';
import { ProjectUsageRange } from '../enums/project-usage-range';
export declare class Project {
    client: Client;
    constructor(client: Client);
    /**
     * Get project usage stats
     *
     *
     * @param {string} startDate
     * @param {string} endDate
     * @param {ProjectUsageRange} period
     * @throws {AppwriteException}
     * @returns {Promise<Models.UsageProject>}
     */
    getUsage(startDate: string, endDate: string, period?: ProjectUsageRange): Promise<Models.UsageProject>;
    /**
     * List Variables
     *
     * Get a list of all project variables. These variables will be accessible in all Appconda Functions at runtime.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.VariableList>}
     */
    listVariables(): Promise<Models.VariableList>;
    /**
     * Create Variable
     *
     * Create a new project variable. This variable will be accessible in all Appconda Functions at runtime.
     *
     * @param {string} key
     * @param {string} value
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    createVariable(key: string, value: string): Promise<Models.Variable>;
    /**
     * Get Variable
     *
     * Get a project variable by its unique ID.
     *
     * @param {string} variableId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    getVariable(variableId: string): Promise<Models.Variable>;
    /**
     * Update Variable
     *
     * Update project variable by its unique ID. This variable will be accessible in all Appconda Functions at runtime.
     *
     * @param {string} variableId
     * @param {string} key
     * @param {string} value
     * @throws {AppwriteException}
     * @returns {Promise<Models.Variable>}
     */
    updateVariable(variableId: string, key: string, value?: string): Promise<Models.Variable>;
    /**
     * Delete Variable
     *
     * Delete a project variable by its unique ID.
     *
     * @param {string} variableId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteVariable(variableId: string): Promise<{}>;
}
