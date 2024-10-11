import { Response } from '../../Response';
import { Model } from '../Model';

export class Session extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Session ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Session creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Session update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('userId', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '5e5bb8c16897e',
            })
            .addRule('expire', {
                type: Model.TYPE_DATETIME,
                description: 'Session expiration date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('provider', {
                type: Model.TYPE_STRING,
                description: 'Session Provider.',
                default: '',
                example: 'email',
            })
            .addRule('providerUid', {
                type: Model.TYPE_STRING,
                description: 'Session Provider User ID.',
                default: '',
                example: 'user@example.com',
            })
            .addRule('providerAccessToken', {
                type: Model.TYPE_STRING,
                description: 'Session Provider Access Token.',
                default: '',
                example: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3',
            })
            .addRule('providerAccessTokenExpiry', {
                type: Model.TYPE_DATETIME,
                description: 'The date of when the access token expires in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('providerRefreshToken', {
                type: Model.TYPE_STRING,
                description: 'Session Provider Refresh Token.',
                default: '',
                example: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3',
            })
            .addRule('ip', {
                type: Model.TYPE_STRING,
                description: 'IP in use when the session was created.',
                default: '',
                example: '127.0.0.1',
            })
            .addRule('osCode', {
                type: Model.TYPE_STRING,
                description: 'Operating system code name. View list of [available options](https://github.com/appconda/appconda/blob/master/docs/lists/os.json).',
                default: '',
                example: 'Mac',
            })
            .addRule('osName', {
                type: Model.TYPE_STRING,
                description: 'Operating system name.',
                default: '',
                example: 'Mac',
            })
            .addRule('osVersion', {
                type: Model.TYPE_STRING,
                description: 'Operating system version.',
                default: '',
                example: 'Mac',
            })
            .addRule('clientType', {
                type: Model.TYPE_STRING,
                description: 'Client type.',
                default: '',
                example: 'browser',
            })
            .addRule('clientCode', {
                type: Model.TYPE_STRING,
                description: 'Client code name. View list of [available options](https://github.com/appconda/appconda/blob/master/docs/lists/clients.json).',
                default: '',
                example: 'CM',
            })
            .addRule('clientName', {
                type: Model.TYPE_STRING,
                description: 'Client name.',
                default: '',
                example: 'Chrome Mobile iOS',
            })
            .addRule('clientVersion', {
                type: Model.TYPE_STRING,
                description: 'Client version.',
                default: '',
                example: '84.0',
            })
            .addRule('clientEngine', {
                type: Model.TYPE_STRING,
                description: 'Client engine name.',
                default: '',
                example: 'WebKit',
            })
            .addRule('clientEngineVersion', {
                type: Model.TYPE_STRING,
                description: 'Client engine name.',
                default: '',
                example: '605.1.15',
            })
            .addRule('deviceName', {
                type: Model.TYPE_STRING,
                description: 'Device name.',
                default: '',
                example: 'smartphone',
            })
            .addRule('deviceBrand', {
                type: Model.TYPE_STRING,
                description: 'Device brand name.',
                default: '',
                example: 'Google',
            })
            .addRule('deviceModel', {
                type: Model.TYPE_STRING,
                description: 'Device model name.',
                default: '',
                example: 'Nexus 5',
            })
            .addRule('countryCode', {
                type: Model.TYPE_STRING,
                description: 'Country two-character ISO 3166-1 alpha code.',
                default: '',
                example: 'US',
            })
            .addRule('countryName', {
                type: Model.TYPE_STRING,
                description: 'Country name.',
                default: '',
                example: 'United States',
            })
            .addRule('current', {
                type: Model.TYPE_BOOLEAN,
                description: 'Returns true if this the current user session.',
                default: false,
                example: true,
            })
            .addRule('factors', {
                type: Model.TYPE_STRING,
                description: 'Returns a list of active session factors.',
                default: [],
                example: ['email'],
                array: true,
            })
            .addRule('secret', {
                type: Model.TYPE_STRING,
                description: 'Secret used to authenticate the user. Only included if the request was made with an API key',
                default: '',
                example: '5e5bb8c16897e',
            })
            .addRule('mfaUpdatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Most recent date in ISO 8601 format when the session successfully passed MFA challenge.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Session';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_SESSION;
    }
}
