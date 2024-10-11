import { Filter } from './Response/Filter';


import { Response as TuvalResponse } from '../../Tuval/Http';
import { Response as ExpressResponse } from 'express';
import { Model } from './Response/Model';
import { Document } from '../../Tuval/Core';
import { None } from './Response/Models/None';
import { Any } from './Response/Models/Any';
import { ErrorModel } from './Response/Models/Error';
import { ErrorDev } from './Response/Models/ErrorDev';
import { BaseList } from './Response/Models/BaseList';
import { Database } from './Response/Models/Database';
import { Collection } from './Response/Models/Collection';
import { Attribute } from './Response/Models/Attribute';
import { AttributeList } from './Response/Models/AttributeList';
import { AttributeString } from './Response/Models/AttributeString';
import { AttributeInteger } from './Response/Models/AttributeInteger';
import { AttributeFloat } from './Response/Models/AttributeFloat';
import { AttributeBoolean } from './Response/Models/AttributeBoolean';
import { AttributeEmail } from './Response/Models/AttributeEmail';
import { AttributeEnum } from './Response/Models/AttributeEnum';
import { AttributeIP } from './Response/Models/AttributeIP';
import { AttributeURL } from './Response/Models/AttributeURL';
import { AttributeDatetime } from './Response/Models/AttributeDatetime';
import { AttributeRelationship } from './Response/Models/AttributeRelationship';
import { Index } from './Response/Models/Index';
import { ModelDocument } from './Response/Models/Document';
import { Log } from './Response/Models/Log';
import { User } from './Response/Models/User';
import { AlgoMd5 } from './Response/Models/AlgoMd5';
import { AlgoSha } from './Response/Models/AlgoSha';
import { AlgoPhpass } from './Response/Models/AlgoPhpass';
import { AlgoBcrypt } from './Response/Models/AlgoBcrypt';
import { AlgoScrypt } from './Response/Models/AlgoScrypt';
import { AlgoScryptModified } from './Response/Models/AlgoScryptModified';
import { AlgoArgon2 } from './Response/Models/AlgoArgon2';
import { Account } from './Response/Models/Account';
import { Preferences } from './Response/Models/Preferences';
import { Session } from './Response/Models/Session';
import { Identity } from './Response/Models/Identity';
import { Token } from './Response/Models/Token';
import { JWT } from './Response/Models/JWT';
import { Locale } from './Response/Models/Locale';
import { LocaleCode } from './Response/Models/LocaleCode';
import { File } from './Response/Models/File';
import { Bucket } from './Response/Models/Bucket';
import { Team } from './Response/Models/Team';
import { Membership } from './Response/Models/Membership';
import { Func } from './Response/Models/Func';
import { Installation } from './Response/Models/Installation';
import { ProviderRepository } from './Response/Models/ProviderRepository';
import { Detection } from './Response/Models/Detection';
import { Branch } from './Response/Models/Branch';
import { Runtime } from './Response/Models/Runtime';
import { Deployment } from './Response/Models/Deployment';
import { Execution } from './Response/Models/Execution';
import { Project } from './Response/Models/Project';
import { Build } from './Response/Models/Build';
import { Webhook } from './Response/Models/Webhook';
import { Key } from './Response/Models/Key';
import { AuthProvider } from './Response/Models/AuthProvider';
import { Platform } from './Response/Models/Platform';
import { Variable } from './Response/Models/Variable';
import { Country } from './Response/Models/Country';
import { Continent } from './Response/Models/Continent';
import { Language } from './Response/Models/Language';
import { Currency } from './Response/Models/Currency';
import { Phone } from './Response/Models/Phone';
import { HealthAntivirus } from './Response/Models/HealthAntivirus';
import { HealthQueue } from './Response/Models/HealthQueue';
import { HealthStatus } from './Response/Models/HealthStatus';
import { HealthCertificate } from './Response/Models/HealthCertificate';
import { HealthTime } from './Response/Models/HealthTime';
import { HealthVersion } from './Response/Models/HealthVersion';
import { Metric } from './Response/Models/Metric';
import { MetricBreakdown } from './Response/Models/MetricBreakdown';
import { UsageDatabases } from './Response/Models/UsageDatabases';
import { UsageDatabase } from './Response/Models/UsageDatabase';
import { UsageCollection } from './Response/Models/UsageCollection';
import { UsageUsers } from './Response/Models/UsageUsers';
import { UsageStorage } from './Response/Models/UsageStorage';
import { UsageBuckets } from './Response/Models/UsageBuckets';
import { UsageFunctions } from './Response/Models/UsageFunctions';
import { UsageFunction } from './Response/Models/UsageFunction';
import { UsageProject } from './Response/Models/UsageProject';
import { Headers } from './Response/Models/Headers';
import { Rule } from './Response/Models/Rule';
import { TemplateSMS } from './Response/Models/TemplateSMS';
import { TemplateEmail } from './Response/Models/TemplateEmail';
import { ConsoleVariables } from './Response/Models/ConsoleVariables';
import { MFAChallenge } from './Response/Models/MFAChallenge';
import { MFARecoveryCodes } from './Response/Models/MFARecoveryCodes';
import { MFAType } from './Response/Models/MFAType';
import { MFAFactors } from './Response/Models/MFAFactors';
import { Provider } from './Response/Models/Provider';
import { Message } from './Response/Models/Message';
import { Topic } from './Response/Models/Topic';
import { Subscriber } from './Response/Models/Subscriber';
import { Target } from './Response/Models/Target';
import { Migration } from './Response/Models/Migration';
import { MigrationReport } from './Response/Models/MigrationReport';
import { MigrationFirebaseProject } from './Response/Models/MigrationFirebaseProject';
import { Mock } from './Response/Models/Mock';


// HTTP content types
const CONTENT_TYPE_YAML = 'application/x-yaml';
const CONTENT_TYPE_NULL = 'null';

export class Response extends TuvalResponse {
    // General Models
    public static readonly MODEL_NONE = 'none';
    public static readonly MODEL_ANY = 'any';
    public static readonly MODEL_LOG = 'log';
    public static readonly MODEL_LOG_LIST = 'logList';
    public static readonly MODEL_ERROR = 'error';
    public static readonly MODEL_METRIC = 'metric';
    public static readonly MODEL_METRIC_LIST = 'metricList';
    public static readonly MODEL_METRIC_BREAKDOWN = 'metricBreakdown';
    public static readonly MODEL_ERROR_DEV = 'errorDev';
    public static readonly MODEL_BASE_LIST = 'baseList';
    public static readonly MODEL_USAGE_DATABASES = 'usageDatabases';
    public static readonly MODEL_USAGE_DATABASE = 'usageDatabase';
    public static readonly MODEL_USAGE_COLLECTION = 'usageCollection';
    public static readonly MODEL_USAGE_USERS = 'usageUsers';
    public static readonly MODEL_USAGE_BUCKETS = 'usageBuckets';
    public static readonly MODEL_USAGE_STORAGE = 'usageStorage';
    public static readonly MODEL_USAGE_FUNCTIONS = 'usageFunctions';
    public static readonly MODEL_USAGE_FUNCTION = 'usageFunction';
    public static readonly MODEL_USAGE_PROJECT = 'usageProject';

    // Database Models
    public static readonly MODEL_DATABASE = 'database';
    public static readonly MODEL_DATABASE_LIST = 'databaseList';
    public static readonly MODEL_COLLECTION = 'collection';
    public static readonly MODEL_COLLECTION_LIST = 'collectionList';
    public static readonly MODEL_INDEX = 'index';
    public static readonly MODEL_INDEX_LIST = 'indexList';
    public static readonly MODEL_DOCUMENT = 'document';
    public static readonly MODEL_DOCUMENT_LIST = 'documentList';

    // Database Attribute Models
    public static readonly MODEL_ATTRIBUTE = 'attribute';
    public static readonly MODEL_ATTRIBUTE_LIST = 'attributeList';
    public static readonly MODEL_ATTRIBUTE_STRING = 'attributeString';
    public static readonly MODEL_ATTRIBUTE_INTEGER = 'attributeInteger';
    public static readonly MODEL_ATTRIBUTE_FLOAT = 'attributeFloat';
    public static readonly MODEL_ATTRIBUTE_BOOLEAN = 'attributeBoolean';
    public static readonly MODEL_ATTRIBUTE_EMAIL = 'attributeEmail';
    public static readonly MODEL_ATTRIBUTE_ENUM = 'attributeEnum';
    public static readonly MODEL_ATTRIBUTE_IP = 'attributeIp';
    public static readonly MODEL_ATTRIBUTE_URL = 'attributeUrl';
    public static readonly MODEL_ATTRIBUTE_DATETIME = 'attributeDatetime';
    public static readonly MODEL_ATTRIBUTE_RELATIONSHIP = 'attributeRelationship';

    // User Models
    public static readonly MODEL_ACCOUNT = 'account';
    public static readonly MODEL_USER = 'user';
    public static readonly MODEL_USER_LIST = 'userList';
    public static readonly MODEL_SESSION = 'session';
    public static readonly MODEL_SESSION_LIST = 'sessionList';
    public static readonly MODEL_IDENTITY = 'identity';
    public static readonly MODEL_IDENTITY_LIST = 'identityList';
    public static readonly MODEL_TOKEN = 'token';
    public static readonly MODEL_JWT = 'jwt';
    public static readonly MODEL_PREFERENCES = 'preferences';

    // MFA Models
    public static readonly MODEL_MFA_TYPE = 'mfaType';
    public static readonly MODEL_MFA_FACTORS = 'mfaFactors';
    public static readonly MODEL_MFA_OTP = 'mfaTotp';
    public static readonly MODEL_MFA_CHALLENGE = 'mfaChallenge';
    public static readonly MODEL_MFA_RECOVERY_CODES = 'mfaRecoveryCodes';

    // Password Algorithms Models
    public static readonly MODEL_ALGO_MD5 = 'algoMd5';
    public static readonly MODEL_ALGO_SHA = 'algoSha';
    public static readonly MODEL_ALGO_SCRYPT = 'algoScrypt';
    public static readonly MODEL_ALGO_SCRYPT_MODIFIED = 'algoScryptModified';
    public static readonly MODEL_ALGO_BCRYPT = 'algoBcrypt';
    public static readonly MODEL_ALGO_ARGON2 = 'algoArgon2';
    public static readonly MODEL_ALGO_PHPASS = 'algoPhpass';

    // Storage Models
    public static readonly MODEL_FILE = 'file';
    public static readonly MODEL_FILE_LIST = 'fileList';
    public static readonly MODEL_BUCKET = 'bucket';
    public static readonly MODEL_BUCKET_LIST = 'bucketList';

    // Locale Models
    public static readonly MODEL_LOCALE = 'locale';
    public static readonly MODEL_LOCALE_CODE = 'localeCode';
    public static readonly MODEL_LOCALE_CODE_LIST = 'localeCodeList';
    public static readonly MODEL_COUNTRY = 'country';
    public static readonly MODEL_COUNTRY_LIST = 'countryList';
    public static readonly MODEL_CONTINENT = 'continent';
    public static readonly MODEL_CONTINENT_LIST = 'continentList';
    public static readonly MODEL_CURRENCY = 'currency';
    public static readonly MODEL_CURRENCY_LIST = 'currencyList';
    public static readonly MODEL_LANGUAGE = 'language';
    public static readonly MODEL_LANGUAGE_LIST = 'languageList';
    public static readonly MODEL_PHONE = 'phone';
    public static readonly MODEL_PHONE_LIST = 'phoneList';

    // Messaging Models
    public static readonly MODEL_PROVIDER = 'provider';
    public static readonly MODEL_PROVIDER_LIST = 'providerList';
    public static readonly MODEL_MESSAGE = 'message';
    public static readonly MODEL_MESSAGE_LIST = 'messageList';
    public static readonly MODEL_TOPIC = 'topic';
    public static readonly MODEL_TOPIC_LIST = 'topicList';
    public static readonly MODEL_SUBSCRIBER = 'subscriber';
    public static readonly MODEL_SUBSCRIBER_LIST = 'subscriberList';
    public static readonly MODEL_TARGET = 'target';
    public static readonly MODEL_TARGET_LIST = 'targetList';

    // Teams Models
    public static readonly MODEL_TEAM = 'team';
    public static readonly MODEL_TEAM_LIST = 'teamList';
    public static readonly MODEL_MEMBERSHIP = 'membership';
    public static readonly MODEL_MEMBERSHIP_LIST = 'membershipList';

    // VCS Models
    public static readonly MODEL_INSTALLATION = 'installation';
    public static readonly MODEL_INSTALLATION_LIST = 'installationList';
    public static readonly MODEL_PROVIDER_REPOSITORY = 'providerRepository';
    public static readonly MODEL_PROVIDER_REPOSITORY_LIST = 'providerRepositoryList';
    public static readonly MODEL_BRANCH = 'branch';
    public static readonly MODEL_BRANCH_LIST = 'branchList';
    public static readonly MODEL_DETECTION = 'detection';

    // Functions Models
    public static readonly MODEL_FUNCTION = 'function';
    public static readonly MODEL_FUNCTION_LIST = 'functionList';
    public static readonly MODEL_RUNTIME = 'runtime';
    public static readonly MODEL_RUNTIME_LIST = 'runtimeList';
    public static readonly MODEL_DEPLOYMENT = 'deployment';
    public static readonly MODEL_DEPLOYMENT_LIST = 'deploymentList';
    public static readonly MODEL_EXECUTION = 'execution';
    public static readonly MODEL_EXECUTION_LIST = 'executionList';
    public static readonly MODEL_BUILD = 'build';
    public static readonly MODEL_BUILD_LIST = 'buildList'; // Not used anywhere yet
    public static readonly MODEL_FUNC_PERMISSIONS = 'funcPermissions';
    public static readonly MODEL_HEADERS = 'headers';

    // Proxy Models
    public static readonly MODEL_PROXY_RULE = 'proxyRule';
    public static readonly MODEL_PROXY_RULE_LIST = 'proxyRuleList';

    // Migrations Models
    public static readonly MODEL_MIGRATION = 'migration';
    public static readonly MODEL_MIGRATION_LIST = 'migrationList';
    public static readonly MODEL_MIGRATION_REPORT = 'migrationReport';
    public static readonly MODEL_MIGRATION_FIREBASE_PROJECT = 'firebaseProject';
    public static readonly MODEL_MIGRATION_FIREBASE_PROJECT_LIST = 'firebaseProjectList';

    // Project Models
    public static readonly MODEL_PROJECT = 'project';
    public static readonly MODEL_PROJECT_LIST = 'projectList';
    public static readonly MODEL_WEBHOOK = 'webhook';
    public static readonly MODEL_WEBHOOK_LIST = 'webhookList';
    public static readonly MODEL_KEY = 'key';
    public static readonly MODEL_KEY_LIST = 'keyList';
    public static readonly MODEL_AUTH_PROVIDER = 'authProvider';
    public static readonly MODEL_AUTH_PROVIDER_LIST = 'authProviderList';
    public static readonly MODEL_PLATFORM = 'platform';
    public static readonly MODEL_PLATFORM_LIST = 'platformList';
    public static readonly MODEL_VARIABLE = 'variable';
    public static readonly MODEL_VARIABLE_LIST = 'variableList';
    public static readonly MODEL_VCS = 'vcs';
    public static readonly MODEL_SMS_TEMPLATE = 'smsTemplate';
    public static readonly MODEL_EMAIL_TEMPLATE = 'emailTemplate';

    // Health Models
    public static readonly MODEL_HEALTH_STATUS = 'healthStatus';
    public static readonly MODEL_HEALTH_VERSION = 'healthVersion';
    public static readonly MODEL_HEALTH_QUEUE = 'healthQueue';
    public static readonly MODEL_HEALTH_TIME = 'healthTime';
    public static readonly MODEL_HEALTH_ANTIVIRUS = 'healthAntivirus';
    public static readonly MODEL_HEALTH_CERTIFICATE = 'healthCertificate';
    public static readonly MODEL_HEALTH_STATUS_LIST = 'healthStatusList';

    // Console Models
    public static readonly MODEL_CONSOLE_VARIABLES = 'consoleVariables';

    // Deprecated Models
    public static readonly MODEL_PERMISSIONS = 'permissions';
    public static readonly MODEL_RULE = 'rule';
    public static readonly MODEL_TASK = 'task';
    public static readonly MODEL_DOMAIN = 'domain';
    public static readonly MODEL_DOMAIN_LIST = 'domainList';

    // Test Models
    public static readonly MODEL_MOCK = 'mock';

    // General
    protected filters: Filter[] = [];
    protected payload: Record<string, any> = {};

    // List of defined output objects
    protected models: Record<string, Model> = {};

    constructor(response: ExpressResponse) {
        super(response);
        // Initialize Models
        this.setModel(new None());
        this.setModel(new Any());
        this.setModel(new ErrorModel());
        this.setModel(new ErrorDev());

        // Lists
        this.setModel(new BaseList('Documents List', Response.MODEL_DOCUMENT_LIST, 'documents', Response.MODEL_DOCUMENT));
        this.setModel(new BaseList('Collections List', Response.MODEL_COLLECTION_LIST, 'collections', Response.MODEL_COLLECTION));
        this.setModel(new BaseList('Databases List', Response.MODEL_DATABASE_LIST, 'databases', Response.MODEL_DATABASE));
        this.setModel(new BaseList('Indexes List', Response.MODEL_INDEX_LIST, 'indexes', Response.MODEL_INDEX));
        this.setModel(new BaseList('Users List', Response.MODEL_USER_LIST, 'users', Response.MODEL_USER));
        this.setModel(new BaseList('Sessions List', Response.MODEL_SESSION_LIST, 'sessions', Response.MODEL_SESSION));
        this.setModel(new BaseList('Identities List', Response.MODEL_IDENTITY_LIST, 'identities', Response.MODEL_IDENTITY));
        this.setModel(new BaseList('Logs List', Response.MODEL_LOG_LIST, 'logs', Response.MODEL_LOG));
        this.setModel(new BaseList('Files List', Response.MODEL_FILE_LIST, 'files', Response.MODEL_FILE));
        this.setModel(new BaseList('Buckets List', Response.MODEL_BUCKET_LIST, 'buckets', Response.MODEL_BUCKET));
        this.setModel(new BaseList('Teams List', Response.MODEL_TEAM_LIST, 'teams', Response.MODEL_TEAM));
        this.setModel(new BaseList('Memberships List', Response.MODEL_MEMBERSHIP_LIST, 'memberships', Response.MODEL_MEMBERSHIP));
        this.setModel(new BaseList('Functions List', Response.MODEL_FUNCTION_LIST, 'functions', Response.MODEL_FUNCTION));
        this.setModel(new BaseList('Installations List', Response.MODEL_INSTALLATION_LIST, 'installations', Response.MODEL_INSTALLATION));
        this.setModel(new BaseList('Provider Repositories List', Response.MODEL_PROVIDER_REPOSITORY_LIST, 'providerRepositories', Response.MODEL_PROVIDER_REPOSITORY));
        this.setModel(new BaseList('Branches List', Response.MODEL_BRANCH_LIST, 'branches', Response.MODEL_BRANCH));
        this.setModel(new BaseList('Runtimes List', Response.MODEL_RUNTIME_LIST, 'runtimes', Response.MODEL_RUNTIME));
        this.setModel(new BaseList('Deployments List', Response.MODEL_DEPLOYMENT_LIST, 'deployments', Response.MODEL_DEPLOYMENT));
        this.setModel(new BaseList('Executions List', Response.MODEL_EXECUTION_LIST, 'executions', Response.MODEL_EXECUTION));
        this.setModel(new BaseList('Builds List', Response.MODEL_BUILD_LIST, 'builds', Response.MODEL_BUILD)); // Not used anywhere yet
        this.setModel(new BaseList('Projects List', Response.MODEL_PROJECT_LIST, 'projects', Response.MODEL_PROJECT, true, false));
        this.setModel(new BaseList('Webhooks List', Response.MODEL_WEBHOOK_LIST, 'webhooks', Response.MODEL_WEBHOOK, true, false));
        this.setModel(new BaseList('API Keys List', Response.MODEL_KEY_LIST, 'keys', Response.MODEL_KEY, true, false));
        this.setModel(new BaseList('Auth Providers List', Response.MODEL_AUTH_PROVIDER_LIST, 'platforms', Response.MODEL_AUTH_PROVIDER, true, false));
        this.setModel(new BaseList('Platforms List', Response.MODEL_PLATFORM_LIST, 'platforms', Response.MODEL_PLATFORM, true, false));
        this.setModel(new BaseList('Countries List', Response.MODEL_COUNTRY_LIST, 'countries', Response.MODEL_COUNTRY));
        this.setModel(new BaseList('Continents List', Response.MODEL_CONTINENT_LIST, 'continents', Response.MODEL_CONTINENT));
        this.setModel(new BaseList('Languages List', Response.MODEL_LANGUAGE_LIST, 'languages', Response.MODEL_LANGUAGE));
        this.setModel(new BaseList('Currencies List', Response.MODEL_CURRENCY_LIST, 'currencies', Response.MODEL_CURRENCY));
        this.setModel(new BaseList('Phones List', Response.MODEL_PHONE_LIST, 'phones', Response.MODEL_PHONE));
        this.setModel(new BaseList('Metric List', Response.MODEL_METRIC_LIST, 'metrics', Response.MODEL_METRIC, true, false));
        this.setModel(new BaseList('Variables List', Response.MODEL_VARIABLE_LIST, 'variables', Response.MODEL_VARIABLE));
        this.setModel(new BaseList('Status List', Response.MODEL_HEALTH_STATUS_LIST, 'statuses', Response.MODEL_HEALTH_STATUS));
        this.setModel(new BaseList('Rule List', Response.MODEL_PROXY_RULE_LIST, 'rules', Response.MODEL_RULE));
        this.setModel(new BaseList('Locale codes list', Response.MODEL_LOCALE_CODE_LIST, 'localeCodes', Response.MODEL_LOCALE_CODE));
        this.setModel(new BaseList('Provider list', Response.MODEL_PROVIDER_LIST, 'providers', Response.MODEL_PROVIDER));
        this.setModel(new BaseList('Message list', Response.MODEL_MESSAGE_LIST, 'messages', Response.MODEL_MESSAGE));
        this.setModel(new BaseList('Topic list', Response.MODEL_TOPIC_LIST, 'topics', Response.MODEL_TOPIC));
        this.setModel(new BaseList('Subscriber list', Response.MODEL_SUBSCRIBER_LIST, 'subscribers', Response.MODEL_SUBSCRIBER));
        this.setModel(new BaseList('Target list', Response.MODEL_TARGET_LIST, 'targets', Response.MODEL_TARGET));
        this.setModel(new BaseList('Migrations List', Response.MODEL_MIGRATION_LIST, 'migrations', Response.MODEL_MIGRATION));
        this.setModel(new BaseList('Migrations Firebase Projects List', Response.MODEL_MIGRATION_FIREBASE_PROJECT_LIST, 'projects', Response.MODEL_MIGRATION_FIREBASE_PROJECT));

        // Entities
        this.setModel(new Database());
        this.setModel(new Collection());
        this.setModel(new Attribute());
        this.setModel(new AttributeList());
        this.setModel(new AttributeString());
        this.setModel(new AttributeInteger());
        this.setModel(new AttributeFloat());
        this.setModel(new AttributeBoolean());
        this.setModel(new AttributeEmail());
        this.setModel(new AttributeEnum());
        this.setModel(new AttributeIP());
        this.setModel(new AttributeURL());
        this.setModel(new AttributeDatetime());
        this.setModel(new AttributeRelationship());
        this.setModel(new Index());
        this.setModel(new ModelDocument());
        this.setModel(new Log());
        this.setModel(new User());
        this.setModel(new AlgoMd5());
        this.setModel(new AlgoSha());
        this.setModel(new AlgoPhpass());
        this.setModel(new AlgoBcrypt());
        this.setModel(new AlgoScrypt());
        this.setModel(new AlgoScryptModified());
        this.setModel(new AlgoArgon2());
        this.setModel(new Account());
        this.setModel(new Preferences());
        this.setModel(new Session());
        this.setModel(new Identity());
        this.setModel(new Token());
        this.setModel(new JWT());
        this.setModel(new Locale());
        this.setModel(new LocaleCode());
        this.setModel(new File());
        this.setModel(new Bucket());
        this.setModel(new Team());
        this.setModel(new Membership());
        this.setModel(new Func());
        this.setModel(new Installation());
        this.setModel(new ProviderRepository());
        this.setModel(new Detection());
        this.setModel(new Branch());
        this.setModel(new Runtime());
        this.setModel(new Deployment());
        this.setModel(new Execution());
        this.setModel(new Build());
        this.setModel(new Project());
        this.setModel(new Webhook());
        this.setModel(new Key());
        this.setModel(new AuthProvider());
        this.setModel(new Platform());
        this.setModel(new Variable());
        this.setModel(new Country());
        this.setModel(new Continent());
        this.setModel(new Language());
        this.setModel(new Currency());
        this.setModel(new Phone());
        this.setModel(new HealthAntivirus());
        this.setModel(new HealthQueue());
        this.setModel(new HealthStatus());
        this.setModel(new HealthCertificate());
        this.setModel(new HealthTime());
        this.setModel(new HealthVersion());
        this.setModel(new Metric());
        this.setModel(new MetricBreakdown());
        this.setModel(new UsageDatabases());
        this.setModel(new UsageDatabase());
        this.setModel(new UsageCollection());
        this.setModel(new UsageUsers());
        this.setModel(new UsageStorage());
        this.setModel(new UsageBuckets());
        this.setModel(new UsageFunctions());
        this.setModel(new UsageFunction());
        this.setModel(new UsageProject());
        this.setModel(new Headers());
        this.setModel(new Rule());
        this.setModel(new TemplateSMS());
        this.setModel(new TemplateEmail());
        this.setModel(new ConsoleVariables());
        this.setModel(new MFAChallenge());
        this.setModel(new MFARecoveryCodes());
        this.setModel(new MFAType());
        this.setModel(new MFAFactors());
        this.setModel(new Provider());
        this.setModel(new Message());
        this.setModel(new Topic());
        this.setModel(new Subscriber());
        this.setModel(new Target());
        this.setModel(new Migration());
        this.setModel(new MigrationReport());
        this.setModel(new MigrationFirebaseProject());
        // Tests (keep last)
        this.setModel(new Mock());

        // Call parent constructor

    }

    /**
     * Set Model Object
     *
     * @param instance Model instance to set
     * @returns this
     */
    public setModel(instance: Model): this {
        this.models[instance.getType()] = instance;
        return this;
    }

    /**
     * Get Model Object
     *
     * @param key Model key
     * @returns Model instance
     * @throws Error if model is undefined
     */
    public getModel(key: string): Model {
        const model = this.models[key];
        if (!model) {
            throw new Error(`Undefined model: ${key}`);
        }
        return model;
    }

    /**
     * Get Models List
     *
     * @returns Array of Model instances
     */
    public getModels(): Model[] {
        return Object.values(this.models);
    }

    /**
     * Apply Filters to Data
     *
     * @param data Data to filter
     * @param model Model type
     * @returns Filtered data
     */
    public applyFilters(data: Record<string, any>, model: string): Record<string, any> {
        for (const filter of this.filters) {
            data = filter.parse(data, model);
        }
        return data;
    }

    /**
     * Validate response objects and outputs
     * the response according to given format type
     *
     * @param document Document data
     * @param model Model type
     */
    public dynamic(document: Document, model: string): void {
        const arrayCopy = document.getArrayCopy();
        const output = this.output(arrayCopy, model);
        const filteredOutput = this.applyFilters(output, model);

        switch (this.getContentType()) {
            case 'application/json':
                this.json(Object.keys(filteredOutput).length > 0 ? filteredOutput : {});
                break;

            case CONTENT_TYPE_YAML:
                this.yaml(Object.keys(filteredOutput).length > 0 ? filteredOutput : {});
                break;

            case CONTENT_TYPE_NULL:
                break;

            default:
                if (model === Response.MODEL_NONE) {
                    this.noContent();
                } else {
                    this.json(Object.keys(filteredOutput).length > 0 ? filteredOutput : {});
                }
                break;
        }
    }

    /**
     * Generate valid response object from document data
     *
     * @param document Document data
     * @param model Model type
     * @returns Processed data
     * @throws Error if required keys are missing or types mismatch
     */
    public output(document: Record<string, any>, model: string): Record<string, any> {
        const data = { ...document };
        const modelInstance = this.getModel(model);
        const output: Record<string, any> = {};

        modelInstance.filter(new Document(data));

        if (modelInstance.isAny()) {
            this.payload = { ...data };
            return this.payload;
        }

        for (const [key, rule] of Object.entries(modelInstance.getRules())) {
            if (!(key in data) && rule.required) {
                if ('default' in rule) {
                    data[key] = rule.default;
                } else {
                    throw new Error(`Model ${modelInstance.getName()} is missing response key: ${key}`);
                }
            }

            if (rule.array) {
                if (!Array.isArray(data[key])) {
                    throw new Error(`${key} must be an array of type ${rule.type}`);
                }

                data[key] = data[key].map((item: any) => {
                    if (item instanceof Document) {
                        const ruleType = Array.isArray(rule.type)
                            ? rule.type.find((type) => {
                                const conditions = this.getModel(type).conditions;
                                return Object.entries(conditions).every(
                                    ([attr, val]) => item[attr] === val
                                );
                            }) || rule.type[0]
                            : rule.type;

                        if (!this.models[ruleType]) {
                            throw new Error(`Missing model for rule: ${ruleType}`);
                        }

                        return this.output({ ...item }, ruleType);
                    }
                    return item;
                });
            } else {
                if (data[key] instanceof Document) {
                    data[key] = this.output({ ...data[key] }, rule.type);
                }
            }

            output[key] = data[key];
        }

        this.payload = output;
        return this.payload;
    }

    /**
     * Output response as file
     *
     * @param body File content
     */
    public file(body: string = ''): void {
        this.payload = {
            payload: body
        };
        this.send(body);
    }

    /**
     * Send YAML response
     *
     * @param data Data to convert to YAML
     * @throws Error if YAML extension is missing
     */
    public yaml(data: Record<string, any>): void {
        if (!this.isYamlExtensionLoaded()) {
            throw new Error('Missing yaml extension. Learn more at: https://www.php.net/manual/en/book.yaml.php');
        }

        this
            .setContentType(CONTENT_TYPE_YAML)
            .send(this.convertToYaml(data));
    }

    /**
     * Get Payload
     *
     * @returns Payload data
     */
    public getPayload(): Record<string, any> {
        return this.payload;
    }

    /**
     * Add a response filter
     *
     * @param filter Filter instance to add
     */
    public addFilter(filter: Filter): void {
        this.filters.push(filter);
    }

    /**
     * Get all filters
     *
     * @returns Array of Filter instances
     */
    public getFilters(): Filter[] {
        return this.filters;
    }

    /**
     * Reset all filters
     */
    public resetFilters(): void {
        this.filters = [];
    }

    /**
     * Check if any filters are set
     *
     * @returns Boolean indicating presence of filters
     */
    public hasFilters(): boolean {
        return this.filters.length > 0;
    }

    /**
     * Set HTTP Header
     *
     * @param key Header key
     * @param value Header value
     */
    public setHeader(key: string, value: string): void {
        this.addHeader(key, value);
    }

    /**
     * Check if YAML extension is loaded
     *
     * @returns Boolean indicating if YAML is loaded
     */
    private isYamlExtensionLoaded(): boolean {
        // In TypeScript, you might use a YAML library instead of checking extensions
        // This is a placeholder for demonstration
        return true;
    }

    /**
     * Convert data to YAML string
     *
     * @param data Data to convert
     * @returns YAML string
     */
    private convertToYaml(data: Record<string, any>): string {
        // Implement YAML conversion using a library like js-yaml
        // This is a placeholder for demonstration
        return JSON.stringify(data); // Replace with actual YAML conversion
    }
}