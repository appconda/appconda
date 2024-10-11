import { Client } from '../client';
import type { Models } from '../models';
import { ResourceType } from '../enums/resource-type';
export declare class Proxy {
    client: Client;
    constructor(client: Client);
    /**
     * List Rules
     *
     * Get a list of all the proxy rules. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRuleList>}
     */
    listRules(queries?: string[], search?: string): Promise<Models.ProxyRuleList>;
    /**
     * Create Rule
     *
     * Create a new proxy rule.
     *
     * @param {string} domain
     * @param {ResourceType} resourceType
     * @param {string} resourceId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRule>}
     */
    createRule(domain: string, resourceType: ResourceType, resourceId?: string): Promise<Models.ProxyRule>;
    /**
     * Get Rule
     *
     * Get a proxy rule by its unique ID.
     *
     * @param {string} ruleId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRule>}
     */
    getRule(ruleId: string): Promise<Models.ProxyRule>;
    /**
     * Delete Rule
     *
     * Delete a proxy rule by its unique ID.
     *
     * @param {string} ruleId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteRule(ruleId: string): Promise<{}>;
    /**
     * Update Rule Verification Status
     *
     *
     * @param {string} ruleId
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProxyRule>}
     */
    updateRuleVerification(ruleId: string): Promise<Models.ProxyRule>;
}
