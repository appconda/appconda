import { Auth } from '../../../../Tuval/Auth';
import { Response } from '../../Response';
import { Model } from '../Model';
import { Document } from '../../../../Tuval/Core';
import { Config } from '../../../../Tuval/Config';


export class Project extends Model {
    protected public: boolean = false;

    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Project ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Project creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Project update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Project name.',
                default: '',
                example: 'New Project',
            })
            .addRule('description', {
                type: Model.TYPE_STRING,
                description: 'Project description.',
                default: '',
                example: 'This is a new project.',
            })
            .addRule('teamId', {
                type: Model.TYPE_STRING,
                description: 'Project team ID.',
                default: '',
                example: '1592981250',
            })
            .addRule('logo', {
                type: Model.TYPE_STRING,
                description: 'Project logo file ID.',
                default: '',
                example: '5f5c451b403cb',
            })
            .addRule('url', {
                type: Model.TYPE_STRING,
                description: 'Project website URL.',
                default: '',
                example: '5f5c451b403cb',
            })
            .addRule('legalName', {
                type: Model.TYPE_STRING,
                description: 'Company legal name.',
                default: '',
                example: 'Company LTD.',
            })
            .addRule('legalCountry', {
                type: Model.TYPE_STRING,
                description: 'Country code in [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1) two-character format.',
                default: '',
                example: 'US',
            })
            .addRule('legalState', {
                type: Model.TYPE_STRING,
                description: 'State name.',
                default: '',
                example: 'New York',
            })
            .addRule('legalCity', {
                type: Model.TYPE_STRING,
                description: 'City name.',
                default: '',
                example: 'New York City.',
            })
            .addRule('legalAddress', {
                type: Model.TYPE_STRING,
                description: 'Company Address.',
                default: '',
                example: '620 Eighth Avenue, New York, NY 10018',
            })
            .addRule('legalTaxId', {
                type: Model.TYPE_STRING,
                description: 'Company Tax ID.',
                default: '',
                example: '131102020',
            })
            .addRule('authDuration', {
                type: Model.TYPE_INTEGER,
                description: 'Session duration in seconds.',
                default: Auth.TOKEN_EXPIRATION_LOGIN_LONG,
                example: 60,
            })
            .addRule('authLimit', {
                type: Model.TYPE_INTEGER,
                description: 'Max users allowed. 0 is unlimited.',
                default: 0,
                example: 100,
            })
            .addRule('authSessionsLimit', {
                type: Model.TYPE_INTEGER,
                description: 'Max sessions allowed per user. 100 maximum.',
                default: 10,
                example: 10,
            })
            .addRule('authPasswordHistory', {
                type: Model.TYPE_INTEGER,
                description: 'Max allowed passwords in the history list per user. Max passwords limit allowed in history is 20. Use 0 for disabling password history.',
                default: 0,
                example: 5,
            })
            .addRule('authPasswordDictionary', {
                type: Model.TYPE_BOOLEAN,
                description: 'Whether or not to check user\'s password against most commonly used passwords.',
                default: false,
                example: true,
            })
            .addRule('authPersonalDataCheck', {
                type: Model.TYPE_BOOLEAN,
                description: 'Whether or not to check the user password for similarity with their personal data.',
                default: false,
                example: true,
            })
            .addRule('oAuthProviders', {
                type: Response.MODEL_AUTH_PROVIDER,
                description: 'List of Auth Providers.',
                default: [],
                example: [new Object()],
                array: true,
            })
            .addRule('platforms', {
                type: Response.MODEL_PLATFORM,
                description: 'List of Platforms.',
                default: [],
                example: new Object(),
                array: true,
            })
            .addRule('webhooks', {
                type: Response.MODEL_WEBHOOK,
                description: 'List of Webhooks.',
                default: [],
                example: new Object(),
                array: true,
            })
            .addRule('keys', {
                type: Response.MODEL_KEY,
                description: 'List of API Keys.',
                default: [],
                example: new Object(),
                array: true,
            })
            .addRule('smtpEnabled', {
                type: Model.TYPE_BOOLEAN,
                description: 'Status for custom SMTP',
                default: false,
                example: false,
                array: false,
            })
            .addRule('smtpSenderName', {
                type: Model.TYPE_STRING,
                description: 'SMTP sender name',
                default: '',
                example: 'John Appconda',
            })
            .addRule('smtpSenderEmail', {
                type: Model.TYPE_STRING,
                description: 'SMTP sender email',
                default: '',
                example: 'john@appconda.io',
            })
            .addRule('smtpReplyTo', {
                type: Model.TYPE_STRING,
                description: 'SMTP reply to email',
                default: '',
                example: 'support@appconda.io',
            })
            .addRule('smtpHost', {
                type: Model.TYPE_STRING,
                description: 'SMTP server host name',
                default: '',
                example: 'mail.appconda.io',
            })
            .addRule('smtpPort', {
                type: Model.TYPE_INTEGER,
                description: 'SMTP server port',
                default: '',
                example: 25,
            })
            .addRule('smtpUsername', {
                type: Model.TYPE_STRING,
                description: 'SMTP server username',
                default: '',
                example: 'emailuser',
            })
            .addRule('smtpPassword', {
                type: Model.TYPE_STRING,
                description: 'SMTP server password',
                default: '',
                example: 'securepassword',
            })
            .addRule('smtpSecure', {
                type: Model.TYPE_STRING,
                description: 'SMTP server secure protocol',
                default: '',
                example: 'tls',
            });

        const services = Config.getParam('services', []);
        const auth = Config.getParam('auth', []);

        for (const methodKey of Object.keys(auth)) {
            const method = auth[methodKey];
            const name = method.name ?? '';
            const key = method.key ?? '';

            this.addRule('auth' + this.capitalizeFirstLetter(key), {
                type: Model.TYPE_BOOLEAN,
                description: `${name} auth method status`,
                example: true,
                default: true,
            });
        }

        for (const serviceKey of Object.keys(services)) {
            const service = services[serviceKey];
            if (!service.optional) {
                continue;
            }

            const name = service.name ?? '';
            const key = service.key ?? '';

            this.addRule('serviceStatusFor' + this.capitalizeFirstLetter(key), {
                type: Model.TYPE_BOOLEAN,
                description: `${name} service status`,
                example: true,
                default: true,
            });
        }
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Project';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_PROJECT;
    }

    /**
     * Filter Document
     *
     * @param {Document} document
     * @return {Document}
     */
    public filter(document: Document): Document {
        // SMTP
        const smtp = document.getAttribute('smtp', {});
        document.setAttribute('smtpEnabled', smtp.enabled ?? false);
        document.setAttribute('smtpSenderEmail', smtp.senderEmail ?? '');
        document.setAttribute('smtpSenderName', smtp.senderName ?? '');
        document.setAttribute('smtpReplyTo', smtp.replyTo ?? '');
        document.setAttribute('smtpHost', smtp.host ?? '');
        document.setAttribute('smtpPort', smtp.port ?? '');
        document.setAttribute('smtpUsername', smtp.username ?? '');
        document.setAttribute('smtpPassword', smtp.password ?? '');
        document.setAttribute('smtpSecure', smtp.secure ?? '');

        // Services
        const values = document.getAttribute('services', {});
        const services = Config.getParam('services', []);

        for (const service of services) {
            if (!service.optional) {
                continue;
            }
            const key = service.key ?? '';
            const value = values[key] ?? true;
            document.setAttribute('serviceStatusFor' + this.capitalizeFirstLetter(key), value);
        }

        // Auth
        const authValues = document.getAttribute('auths', {});
        const auth = Config.getParam('auth', []);

        document.setAttribute('authLimit', authValues.limit ?? 0);
        document.setAttribute('authDuration', authValues.duration ?? Auth.TOKEN_EXPIRATION_LOGIN_LONG);
        document.setAttribute('authSessionsLimit', authValues.maxSessions ?? 10);
        document.setAttribute('authPasswordHistory', authValues.passwordHistory ?? 0);
        document.setAttribute('authPasswordDictionary', authValues.passwordDictionary ?? false);
        document.setAttribute('authPersonalDataCheck', authValues.personalDataCheck ?? false);

        for (const method of auth) {
            const key = method.key;
            const value = authValues[key] ?? true;
            document.setAttribute('auth' + this.capitalizeFirstLetter(key), value);
        }

        // OAuth Providers
        const providers = Config.getParam('oAuthProviders', []);
        const providerValues = document.getAttribute('oAuthProviders', []);
        const projectProviders: Document[] = [];

        for (const key in providers) {
            const provider = providers[key];
            if (!provider.enabled) {
                // Disabled by Appconda configuration, exclude from response
                continue;
            }

            projectProviders.push(new Document({
                key: key,
                name: provider.name ?? '',
                appId: providerValues[key + 'Appid'] ?? '',
                secret: providerValues[key + 'Secret'] ?? '',
                enabled: providerValues[key + 'Enabled'] ?? false,
            }));
        }

        document.setAttribute('oAuthProviders', projectProviders);

        return document;
    }

    /**
     * Capitalize the first letter of a string
     *
     * @param {string} string
     * @return {string}
     */
    private capitalizeFirstLetter(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
