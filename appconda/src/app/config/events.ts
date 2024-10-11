


 // General Models
 const MODEL_NONE = 'none';
 const MODEL_ANY = 'any';
 const MODEL_LOG = 'log';
 const MODEL_LOG_LIST = 'logList';
 const MODEL_ERROR = 'error';
 const MODEL_METRIC = 'metric';
 const MODEL_METRIC_LIST = 'metricList';
 const MODEL_METRIC_BREAKDOWN = 'metricBreakdown';
 const MODEL_ERROR_DEV = 'errorDev';
 const MODEL_BASE_LIST = 'baseList';
 const MODEL_USAGE_DATABASES = 'usageDatabases';
 const MODEL_USAGE_DATABASE = 'usageDatabase';
 const MODEL_USAGE_COLLECTION = 'usageCollection';
 const MODEL_USAGE_USERS = 'usageUsers';
 const MODEL_USAGE_BUCKETS = 'usageBuckets';
 const MODEL_USAGE_STORAGE = 'usageStorage';
 const MODEL_USAGE_FUNCTIONS = 'usageFunctions';
 const MODEL_USAGE_FUNCTION = 'usageFunction';
 const MODEL_USAGE_PROJECT = 'usageProject';

 // Database Models
 const MODEL_DATABASE = 'database';
 const MODEL_DATABASE_LIST = 'databaseList';
 const MODEL_COLLECTION = 'collection';
 const MODEL_COLLECTION_LIST = 'collectionList';
 const MODEL_INDEX = 'index';
 const MODEL_INDEX_LIST = 'indexList';
 const MODEL_DOCUMENT = 'document';
 const MODEL_DOCUMENT_LIST = 'documentList';

 // Database Attribute Models
 const MODEL_ATTRIBUTE = 'attribute';
 const MODEL_ATTRIBUTE_LIST = 'attributeList';
 const MODEL_ATTRIBUTE_STRING = 'attributeString';
 const MODEL_ATTRIBUTE_INTEGER = 'attributeInteger';
 const MODEL_ATTRIBUTE_FLOAT = 'attributeFloat';
 const MODEL_ATTRIBUTE_BOOLEAN = 'attributeBoolean';
 const MODEL_ATTRIBUTE_EMAIL = 'attributeEmail';
 const MODEL_ATTRIBUTE_ENUM = 'attributeEnum';
 const MODEL_ATTRIBUTE_IP = 'attributeIp';
 const MODEL_ATTRIBUTE_URL = 'attributeUrl';
 const MODEL_ATTRIBUTE_DATETIME = 'attributeDatetime';
 const MODEL_ATTRIBUTE_RELATIONSHIP = 'attributeRelationship';

 // User Models
 const MODEL_ACCOUNT = 'account';
 const MODEL_USER = 'user';
 const MODEL_USER_LIST = 'userList';
 const MODEL_SESSION = 'session';
 const MODEL_SESSION_LIST = 'sessionList';
 const MODEL_IDENTITY = 'identity';
 const MODEL_IDENTITY_LIST = 'identityList';
 const MODEL_TOKEN = 'token';
 const MODEL_JWT = 'jwt';
 const MODEL_PREFERENCES = 'preferences';

 // MFA Models
 const MODEL_MFA_TYPE = 'mfaType';
 const MODEL_MFA_FACTORS = 'mfaFactors';
 const MODEL_MFA_OTP = 'mfaTotp';
 const MODEL_MFA_CHALLENGE = 'mfaChallenge';
 const MODEL_MFA_RECOVERY_CODES = 'mfaRecoveryCodes';

 // Password Algorithms Models
 const MODEL_ALGO_MD5 = 'algoMd5';
 const MODEL_ALGO_SHA = 'algoSha';
 const MODEL_ALGO_SCRYPT = 'algoScrypt';
 const MODEL_ALGO_SCRYPT_MODIFIED = 'algoScryptModified';
 const MODEL_ALGO_BCRYPT = 'algoBcrypt';
 const MODEL_ALGO_ARGON2 = 'algoArgon2';
 const MODEL_ALGO_PHPASS = 'algoPhpass';

 // Storage Models
 const MODEL_FILE = 'file';
 const MODEL_FILE_LIST = 'fileList';
 const MODEL_BUCKET = 'bucket';
 const MODEL_BUCKET_LIST = 'bucketList';

 // Locale Models
 const MODEL_LOCALE = 'locale';
 const MODEL_LOCALE_CODE = 'localeCode';
 const MODEL_LOCALE_CODE_LIST = 'localeCodeList';
 const MODEL_COUNTRY = 'country';
 const MODEL_COUNTRY_LIST = 'countryList';
 const MODEL_CONTINENT = 'continent';
 const MODEL_CONTINENT_LIST = 'continentList';
 const MODEL_CURRENCY = 'currency';
 const MODEL_CURRENCY_LIST = 'currencyList';
 const MODEL_LANGUAGE = 'language';
 const MODEL_LANGUAGE_LIST = 'languageList';
 const MODEL_PHONE = 'phone';
 const MODEL_PHONE_LIST = 'phoneList';

 // Messaging Models
 const MODEL_PROVIDER = 'provider';
 const MODEL_PROVIDER_LIST = 'providerList';
 const MODEL_MESSAGE = 'message';
 const MODEL_MESSAGE_LIST = 'messageList';
 const MODEL_TOPIC = 'topic';
 const MODEL_TOPIC_LIST = 'topicList';
 const MODEL_SUBSCRIBER = 'subscriber';
 const MODEL_SUBSCRIBER_LIST = 'subscriberList';
 const MODEL_TARGET = 'target';
 const MODEL_TARGET_LIST = 'targetList';
 // Teams Models
 const MODEL_TEAM = 'team';
 const MODEL_TEAM_LIST = 'teamList';
 const MODEL_MEMBERSHIP = 'membership';
 const MODEL_MEMBERSHIP_LIST = 'membershipList';

 // VCS Models
 const MODEL_INSTALLATION = 'installation';
 const MODEL_INSTALLATION_LIST = 'installationList';
 const MODEL_PROVIDER_REPOSITORY = 'providerRepository';
 const MODEL_PROVIDER_REPOSITORY_LIST = 'providerRepositoryList';
 const MODEL_BRANCH = 'branch';
 const MODEL_BRANCH_LIST = 'branchList';
 const MODEL_DETECTION = 'detection';

 // Functions Models
 const MODEL_FUNCTION = 'function';
 const MODEL_FUNCTION_LIST = 'functionList';
 const MODEL_RUNTIME = 'runtime';
 const MODEL_RUNTIME_LIST = 'runtimeList';
 const MODEL_DEPLOYMENT = 'deployment';
 const MODEL_DEPLOYMENT_LIST = 'deploymentList';
 const MODEL_EXECUTION = 'execution';
 const MODEL_EXECUTION_LIST = 'executionList';
 const MODEL_BUILD = 'build';
 const MODEL_BUILD_LIST = 'buildList'; // Not used anywhere yet
 const MODEL_FUNC_PERMISSIONS = 'funcPermissions';
 const MODEL_HEADERS = 'headers';

 // Proxy Models
 const MODEL_PROXY_RULE = 'proxyRule';
 const MODEL_PROXY_RULE_LIST = 'proxyRuleList';

 // Migrations Models
 const MODEL_MIGRATION = 'migration';
 const MODEL_MIGRATION_LIST = 'migrationList';
 const MODEL_MIGRATION_REPORT = 'migrationReport';
 const MODEL_MIGRATION_FIREBASE_PROJECT = 'firebaseProject';
 const MODEL_MIGRATION_FIREBASE_PROJECT_LIST = 'firebaseProjectList';

 // Project Models
 const MODEL_PROJECT = 'project';
 const MODEL_PROJECT_LIST = 'projectList';
 const MODEL_WEBHOOK = 'webhook';
 const MODEL_WEBHOOK_LIST = 'webhookList';
 const MODEL_KEY = 'key';
 const MODEL_KEY_LIST = 'keyList';
 const MODEL_AUTH_PROVIDER = 'authProvider';
 const MODEL_AUTH_PROVIDER_LIST = 'authProviderList';
 const MODEL_PLATFORM = 'platform';
 const MODEL_PLATFORM_LIST = 'platformList';
 const MODEL_VARIABLE = 'variable';
 const MODEL_VARIABLE_LIST = 'variableList';
 const MODEL_VCS = 'vcs';
 const MODEL_SMS_TEMPLATE = 'smsTemplate';
 const MODEL_EMAIL_TEMPLATE = 'emailTemplate';

 // Health Models
 const MODEL_HEALTH_STATUS = 'healthStatus';
 const MODEL_HEALTH_VERSION = 'healthVersion';
 const MODEL_HEALTH_QUEUE = 'healthQueue';
 const MODEL_HEALTH_TIME = 'healthTime';
 const MODEL_HEALTH_ANTIVIRUS = 'healthAntivirus';
 const MODEL_HEALTH_CERTIFICATE = 'healthCertificate';
 const MODEL_HEALTH_STATUS_LIST = 'healthStatusList';

 // Console Models
 const MODEL_CONSOLE_VARIABLES = 'consoleVariables';

 // Deprecated Models
 const MODEL_PERMISSIONS = 'permissions';
 const MODEL_RULE = 'rule';
 const MODEL_TASK = 'task';
 const MODEL_DOMAIN = 'domain';
 const MODEL_DOMAIN_LIST = 'domainList';


export default   {
    users: {
        $model: MODEL_USER,
        $resource: true,
        $description: "This event triggers on any user's event.",
        sessions: {
            $model: MODEL_SESSION,
            $resource: true,
            $description: "This event triggers on any user's sessions event.",
            create: {
                $description: "This event triggers when a session for a user is created.",
            },
            delete: {
                $description: "This event triggers when a session for a user is deleted.",
            },
        },
        recovery: {
            $model: MODEL_TOKEN,
            $resource: true,
            $description: "This event triggers on any user's recovery token event.",
            create: {
                $description: "This event triggers when a recovery token for a user is created.",
            },
            update: {
                $description: "This event triggers when a recovery token for a user is validated.",
            },
        },
        verification: {
            $model: MODEL_TOKEN,
            $resource: true,
            $description: "This event triggers on any user's verification token event.",
            create: {
                $description: "This event triggers when a verification token for a user is created.",
            },
            update: {
                $description: "This event triggers when a verification token for a user is validated.",
            },
        },
        targets: {
            $model: MODEL_TARGET,
            $resource: true,
            $description: "This event triggers on any user's target event.",
            create: {
                $description: "This event triggers when a user's target is created.",
            },
            update: {
                $description: "This event triggers when a user's target is updated.",
            },
            delete: {
                $description: "This event triggers when a user's target is deleted.",
            },
        },
        tokens: {
            $model: MODEL_TOKEN,
            $resource: true,
            $description: "This event triggers on any user's token event.",
            create: {
                $description: "This event triggers when a user's token is created.",
            },
        },
        create: {
            $description: "This event triggers when a user is created.",
        },
        delete: {
            $description: "This event triggers when a user is deleted.",
        },
        update: {
            $description: "This event triggers when a user is updated.",
            email: {
                $description: "This event triggers when a user's email address is updated.",
            },
            name: {
                $description: "This event triggers when a user's name is updated.",
            },
            password: {
                $description: "This event triggers when a user's password is updated.",
            },
            status: {
                $description: "This event triggers when a user's status is updated.",
            },
            prefs: {
                $description: "This event triggers when a user's preferences is updated.",
            },
        },
    },
    databases: {
        $model: MODEL_DATABASE,
        $resource: true,
        $description: "This event triggers on any database event.",
        collections: {
            $model: MODEL_COLLECTION,
            $resource: true,
            $description: "This event triggers on any collection event.",
            documents: {
                $model: MODEL_DOCUMENT,
                $resource: true,
                $description: "This event triggers on any documents event.",
                create: {
                    $description: "This event triggers when a document is created.",
                },
                delete: {
                    $description: "This event triggers when a document is deleted.",
                },
                update: {
                    $description: "This event triggers when a document is updated.",
                },
            },
            indexes: {
                $model: MODEL_INDEX,
                $resource: true,
                $description: "This event triggers on any indexes event.",
                create: {
                    $description: "This event triggers when an index is created.",
                },
                delete: {
                    $description: "This event triggers when an index is deleted.",
                },
            },
            attributes: {
                $model: MODEL_ATTRIBUTE,
                $resource: true,
                $description: "This event triggers on any attributes event.",
                create: {
                    $description: "This event triggers when an attribute is created.",
                },
                delete: {
                    $description: "This event triggers when an attribute is deleted.",
                },
            },
            create: {
                $description: "This event triggers when a collection is created.",
            },
            delete: {
                $description: "This event triggers when a collection is deleted.",
            },
            update: {
                $description: "This event triggers when a collection is updated.",
            },
        },
        create: {
            $description: "This event triggers when a database is created.",
        },
        delete: {
            $description: "This event triggers when a database is deleted.",
        },
        update: {
            $description: "This event triggers when a database is updated.",
        },
    },
    buckets: {
        $model: MODEL_BUCKET,
        $resource: true,
        $description: "This event triggers on any buckets event.",
        files: {
            $model: MODEL_FILE,
            $resource: true,
            $description: "This event triggers on any files event.",
            create: {
                $description: "This event triggers when a file is created.",
            },
            delete: {
                $description: "This event triggers when a file is deleted.",
            },
            update: {
                $description: "This event triggers when a file is updated.",
            },
        },
        create: {
            $description: "This event triggers when a bucket is created.",
        },
        delete: {
            $description: "This event triggers when a bucket is deleted.",
        },
        update: {
            $description: "This event triggers when a bucket is updated.",
        },
    },
    teams: {
        $model: MODEL_TEAM,
        $resource: true,
        $description: "This event triggers on any teams event.",
        memberships: {
            $model: MODEL_MEMBERSHIP,
            $resource: true,
            $description: "This event triggers on any team memberships event.",
            create: {
                $description: "This event triggers when a membership is created.",
            },
            delete: {
                $description: "This event triggers when a membership is deleted.",
            },
            update: {
                $description: "This event triggers when a membership is updated.",
                status: {
                    $description: "This event triggers when a team memberships status is updated.",
                },
            },
        },
        create: {
            $description: "This event triggers when a team is created.",
        },
        delete: {
            $description: "This event triggers when a team is deleted.",
        },
        update: {
            $description: "This event triggers when a team is updated.",
            prefs: {
                $description: "This event triggers when a team's preferences are updated.",
            },
        },
    },
    functions: {
        $model: MODEL_FUNCTION,
        $resource: true,
        $description: "This event triggers on any functions event.",
        deployments: {
            $model: MODEL_DEPLOYMENT,
            $resource: true,
            $description: "This event triggers on any deployments event.",
            create: {
                $description: "This event triggers when a deployment is created.",
            },
            delete: {
                $description: "This event triggers when a deployment is deleted.",
            },
            update: {
                $description: "This event triggers when a deployment is updated.",
            },
        },
        executions: {
            $model: MODEL_EXECUTION,
            $resource: true,
            $description: "This event triggers on any executions event.",
            create: {
                $description: "This event triggers when an execution is created.",
            },
            delete: {
                $description: "This event triggers when an execution is deleted.",
            },
            update: {
                $description: "This event triggers when an execution is updated.",
            },
        },
        create: {
            $description: "This event triggers when a function is created.",
        },
        delete: {
            $description: "This event triggers when a function is deleted.",
        },
        update: {
            $description: "This event triggers when a function is updated.",
        },
    },
    messages: {
        $model: MODEL_MESSAGE,
        $resource: true,
        $description: "This event triggers on any messaging event.",
        create: {
            $description: "This event triggers when a message is created.",
        },
        update: {
            $description: "This event triggers when a message is updated.",
        },
    },
    topics: {
        $model: MODEL_TOPIC,
        $resource: true,
        $description: "This event triggers on any topic event.",
        create: {
            $description: "This event triggers when a topic is created.",
        },
        update: {
            $description: "This event triggers when a topic is updated.",
        },
        delete: {
            $description: "This event triggers when a topic is deleted.",
        },
        subscribers: {
            $model: MODEL_SUBSCRIBER,
            $resource: true,
            $description: "This event triggers on any subscriber event.",
            create: {
                $description: "This event triggers when a subscriber is created.",
            },
            delete: {
                $description: "This event triggers when a subscriber is deleted.",
            },
        },
    },
    providers: {
        $model: MODEL_PROVIDER,
        $resource: true,
        $description: "This event triggers on any provider event.",
        create: {
            $description: "This event triggers when a provider is created.",
        },
        update: {
            $description: "This event triggers when a provider is updated.",
        },
        delete: {
            $description: "This event triggers when a provider is deleted.",
        },
    },
    rules: {
        $model: MODEL_PROXY_RULE,
        $resource: true,
        $description: "This event triggers on any proxy rule event.",
        create: {
            $description: "This event triggers when a proxy rule is created.",
        },
        delete: {
            $description: "This event triggers when a proxy rule is deleted.",
        },
        update: {
            $description: "This event triggers when a proxy rule is updated.",
        },
    },
};