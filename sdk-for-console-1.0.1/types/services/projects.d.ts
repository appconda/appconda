import { Client } from '../client';
import type { Models } from '../models';
import { Region } from '../enums/region';
import { Api } from '../enums/api';
import { AuthMethod } from '../enums/auth-method';
import { OAuthProvider } from '../enums/o-auth-provider';
import { PlatformType } from '../enums/platform-type';
import { ApiService } from '../enums/api-service';
import { SMTPSecure } from '../enums/s-m-t-p-secure';
import { EmailTemplateType } from '../enums/email-template-type';
import { EmailTemplateLocale } from '../enums/email-template-locale';
import { SmsTemplateType } from '../enums/sms-template-type';
import { SmsTemplateLocale } from '../enums/sms-template-locale';
export declare class Projects {
    client: Client;
    constructor(client: Client);
    /**
     * List projects
     *
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppwriteException}
     * @returns {Promise<Models.ProjectList>}
     */
    list(queries?: string[], search?: string): Promise<Models.ProjectList>;
    /**
     * Create project
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string} teamId
     * @param {Region} region
     * @param {string} description
     * @param {string} logo
     * @param {string} url
     * @param {string} legalName
     * @param {string} legalCountry
     * @param {string} legalState
     * @param {string} legalCity
     * @param {string} legalAddress
     * @param {string} legalTaxId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    create(projectId: string, name: string, teamId: string, region?: Region, description?: string, logo?: string, url?: string, legalName?: string, legalCountry?: string, legalState?: string, legalCity?: string, legalAddress?: string, legalTaxId?: string): Promise<Models.Project>;
    /**
     * Get project
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    get(projectId: string): Promise<Models.Project>;
    /**
     * Update project
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string} description
     * @param {string} logo
     * @param {string} url
     * @param {string} legalName
     * @param {string} legalCountry
     * @param {string} legalState
     * @param {string} legalCity
     * @param {string} legalAddress
     * @param {string} legalTaxId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    update(projectId: string, name: string, description?: string, logo?: string, url?: string, legalName?: string, legalCountry?: string, legalState?: string, legalCity?: string, legalAddress?: string, legalTaxId?: string): Promise<Models.Project>;
    /**
     * Delete project
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    delete(projectId: string): Promise<{}>;
    /**
     * Update API status
     *
     *
     * @param {string} projectId
     * @param {Api} api
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateApiStatus(projectId: string, api: Api, status: boolean): Promise<Models.Project>;
    /**
     * Update all API status
     *
     *
     * @param {string} projectId
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateApiStatusAll(projectId: string, status: boolean): Promise<Models.Project>;
    /**
     * Update project authentication duration
     *
     *
     * @param {string} projectId
     * @param {number} duration
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthDuration(projectId: string, duration: number): Promise<Models.Project>;
    /**
     * Update project users limit
     *
     *
     * @param {string} projectId
     * @param {number} limit
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthLimit(projectId: string, limit: number): Promise<Models.Project>;
    /**
     * Update project user sessions limit
     *
     *
     * @param {string} projectId
     * @param {number} limit
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthSessionsLimit(projectId: string, limit: number): Promise<Models.Project>;
    /**
     * Update the mock numbers for the project
     *
     *
     * @param {string} projectId
     * @param {object[]} numbers
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateMockNumbers(projectId: string, numbers: object[]): Promise<Models.Project>;
    /**
     * Update authentication password dictionary status. Use this endpoint to enable or disable the dicitonary check for user password
     *
     *
     * @param {string} projectId
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthPasswordDictionary(projectId: string, enabled: boolean): Promise<Models.Project>;
    /**
     * Update authentication password history. Use this endpoint to set the number of password history to save and 0 to disable password history.
     *
     *
     * @param {string} projectId
     * @param {number} limit
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthPasswordHistory(projectId: string, limit: number): Promise<Models.Project>;
    /**
     * Enable or disable checking user passwords for similarity with their personal data.
     *
     *
     * @param {string} projectId
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updatePersonalDataCheck(projectId: string, enabled: boolean): Promise<Models.Project>;
    /**
     * Update project sessions emails
     *
     *
     * @param {string} projectId
     * @param {boolean} alerts
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateSessionAlerts(projectId: string, alerts: boolean): Promise<Models.Project>;
    /**
     * Update project auth method status. Use this endpoint to enable or disable a given auth method for this project.
     *
     *
     * @param {string} projectId
     * @param {AuthMethod} method
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateAuthStatus(projectId: string, method: AuthMethod, status: boolean): Promise<Models.Project>;
    /**
     * Create JWT
     *
     *
     * @param {string} projectId
     * @param {string[]} scopes
     * @param {number} duration
     * @throws {AppwriteException}
     * @returns {Promise<Models.Jwt>}
     */
    createJWT(projectId: string, scopes: string[], duration?: number): Promise<Models.Jwt>;
    /**
     * List keys
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.KeyList>}
     */
    listKeys(projectId: string): Promise<Models.KeyList>;
    /**
     * Create key
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string[]} scopes
     * @param {string} expire
     * @throws {AppwriteException}
     * @returns {Promise<Models.Key>}
     */
    createKey(projectId: string, name: string, scopes: string[], expire?: string): Promise<Models.Key>;
    /**
     * Get key
     *
     *
     * @param {string} projectId
     * @param {string} keyId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Key>}
     */
    getKey(projectId: string, keyId: string): Promise<Models.Key>;
    /**
     * Update key
     *
     *
     * @param {string} projectId
     * @param {string} keyId
     * @param {string} name
     * @param {string[]} scopes
     * @param {string} expire
     * @throws {AppwriteException}
     * @returns {Promise<Models.Key>}
     */
    updateKey(projectId: string, keyId: string, name: string, scopes: string[], expire?: string): Promise<Models.Key>;
    /**
     * Delete key
     *
     *
     * @param {string} projectId
     * @param {string} keyId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteKey(projectId: string, keyId: string): Promise<{}>;
    /**
     * Update project OAuth2
     *
     *
     * @param {string} projectId
     * @param {OAuthProvider} provider
     * @param {string} appId
     * @param {string} secret
     * @param {boolean} enabled
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateOAuth2(projectId: string, provider: OAuthProvider, appId?: string, secret?: string, enabled?: boolean): Promise<Models.Project>;
    /**
     * List platforms
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.PlatformList>}
     */
    listPlatforms(projectId: string): Promise<Models.PlatformList>;
    /**
     * Create platform
     *
     *
     * @param {string} projectId
     * @param {PlatformType} type
     * @param {string} name
     * @param {string} key
     * @param {string} store
     * @param {string} hostname
     * @throws {AppwriteException}
     * @returns {Promise<Models.Platform>}
     */
    createPlatform(projectId: string, type: PlatformType, name: string, key?: string, store?: string, hostname?: string): Promise<Models.Platform>;
    /**
     * Get platform
     *
     *
     * @param {string} projectId
     * @param {string} platformId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Platform>}
     */
    getPlatform(projectId: string, platformId: string): Promise<Models.Platform>;
    /**
     * Update platform
     *
     *
     * @param {string} projectId
     * @param {string} platformId
     * @param {string} name
     * @param {string} key
     * @param {string} store
     * @param {string} hostname
     * @throws {AppwriteException}
     * @returns {Promise<Models.Platform>}
     */
    updatePlatform(projectId: string, platformId: string, name: string, key?: string, store?: string, hostname?: string): Promise<Models.Platform>;
    /**
     * Delete platform
     *
     *
     * @param {string} projectId
     * @param {string} platformId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deletePlatform(projectId: string, platformId: string): Promise<{}>;
    /**
     * Update service status
     *
     *
     * @param {string} projectId
     * @param {ApiService} service
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateServiceStatus(projectId: string, service: ApiService, status: boolean): Promise<Models.Project>;
    /**
     * Update all service status
     *
     *
     * @param {string} projectId
     * @param {boolean} status
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateServiceStatusAll(projectId: string, status: boolean): Promise<Models.Project>;
    /**
     * Update SMTP
     *
     *
     * @param {string} projectId
     * @param {boolean} enabled
     * @param {string} senderName
     * @param {string} senderEmail
     * @param {string} replyTo
     * @param {string} host
     * @param {number} port
     * @param {string} username
     * @param {string} password
     * @param {SMTPSecure} secure
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateSmtp(projectId: string, enabled: boolean, senderName?: string, senderEmail?: string, replyTo?: string, host?: string, port?: number, username?: string, password?: string, secure?: SMTPSecure): Promise<Models.Project>;
    /**
     * Create SMTP test
     *
     *
     * @param {string} projectId
     * @param {string[]} emails
     * @param {string} senderName
     * @param {string} senderEmail
     * @param {string} host
     * @param {string} replyTo
     * @param {number} port
     * @param {string} username
     * @param {string} password
     * @param {SMTPSecure} secure
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    createSmtpTest(projectId: string, emails: string[], senderName: string, senderEmail: string, host: string, replyTo?: string, port?: number, username?: string, password?: string, secure?: SMTPSecure): Promise<{}>;
    /**
     * Update project team
     *
     *
     * @param {string} projectId
     * @param {string} teamId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateTeam(projectId: string, teamId: string): Promise<Models.Project>;
    /**
     * Get custom email template
     *
     *
     * @param {string} projectId
     * @param {EmailTemplateType} type
     * @param {EmailTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.EmailTemplate>}
     */
    getEmailTemplate(projectId: string, type: EmailTemplateType, locale: EmailTemplateLocale): Promise<Models.EmailTemplate>;
    /**
     * Update custom email templates
     *
     *
     * @param {string} projectId
     * @param {EmailTemplateType} type
     * @param {EmailTemplateLocale} locale
     * @param {string} subject
     * @param {string} message
     * @param {string} senderName
     * @param {string} senderEmail
     * @param {string} replyTo
     * @throws {AppwriteException}
     * @returns {Promise<Models.Project>}
     */
    updateEmailTemplate(projectId: string, type: EmailTemplateType, locale: EmailTemplateLocale, subject: string, message: string, senderName?: string, senderEmail?: string, replyTo?: string): Promise<Models.Project>;
    /**
     * Reset custom email template
     *
     *
     * @param {string} projectId
     * @param {EmailTemplateType} type
     * @param {EmailTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.EmailTemplate>}
     */
    deleteEmailTemplate(projectId: string, type: EmailTemplateType, locale: EmailTemplateLocale): Promise<Models.EmailTemplate>;
    /**
     * Get custom SMS template
     *
     *
     * @param {string} projectId
     * @param {SmsTemplateType} type
     * @param {SmsTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.SmsTemplate>}
     */
    getSmsTemplate(projectId: string, type: SmsTemplateType, locale: SmsTemplateLocale): Promise<Models.SmsTemplate>;
    /**
     * Update custom SMS template
     *
     *
     * @param {string} projectId
     * @param {SmsTemplateType} type
     * @param {SmsTemplateLocale} locale
     * @param {string} message
     * @throws {AppwriteException}
     * @returns {Promise<Models.SmsTemplate>}
     */
    updateSmsTemplate(projectId: string, type: SmsTemplateType, locale: SmsTemplateLocale, message: string): Promise<Models.SmsTemplate>;
    /**
     * Reset custom SMS template
     *
     *
     * @param {string} projectId
     * @param {SmsTemplateType} type
     * @param {SmsTemplateLocale} locale
     * @throws {AppwriteException}
     * @returns {Promise<Models.SmsTemplate>}
     */
    deleteSmsTemplate(projectId: string, type: SmsTemplateType, locale: SmsTemplateLocale): Promise<Models.SmsTemplate>;
    /**
     * List webhooks
     *
     *
     * @param {string} projectId
     * @throws {AppwriteException}
     * @returns {Promise<Models.WebhookList>}
     */
    listWebhooks(projectId: string): Promise<Models.WebhookList>;
    /**
     * Create webhook
     *
     *
     * @param {string} projectId
     * @param {string} name
     * @param {string[]} events
     * @param {string} url
     * @param {boolean} security
     * @param {boolean} enabled
     * @param {string} httpUser
     * @param {string} httpPass
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    createWebhook(projectId: string, name: string, events: string[], url: string, security: boolean, enabled?: boolean, httpUser?: string, httpPass?: string): Promise<Models.Webhook>;
    /**
     * Get webhook
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    getWebhook(projectId: string, webhookId: string): Promise<Models.Webhook>;
    /**
     * Update webhook
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @param {string} name
     * @param {string[]} events
     * @param {string} url
     * @param {boolean} security
     * @param {boolean} enabled
     * @param {string} httpUser
     * @param {string} httpPass
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    updateWebhook(projectId: string, webhookId: string, name: string, events: string[], url: string, security: boolean, enabled?: boolean, httpUser?: string, httpPass?: string): Promise<Models.Webhook>;
    /**
     * Delete webhook
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    deleteWebhook(projectId: string, webhookId: string): Promise<{}>;
    /**
     * Update webhook signature key
     *
     *
     * @param {string} projectId
     * @param {string} webhookId
     * @throws {AppwriteException}
     * @returns {Promise<Models.Webhook>}
     */
    updateWebhookSignature(projectId: string, webhookId: string): Promise<Models.Webhook>;
}
