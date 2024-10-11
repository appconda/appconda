import { Response } from '../../Response';
import { Model } from '../Model';

export class Log extends Model {
    constructor() {
        super();

        this
            .addRule('event', {
                type: Model.TYPE_STRING,
                description: 'Event name.',
                default: '',
                example: 'account.sessions.create',
            })
            .addRule('userId', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '610fc2f985ee0',
            })
            .addRule('userEmail', {
                type: Model.TYPE_STRING,
                description: 'User Email.',
                default: '',
                example: 'john@appconda.io',
            })
            .addRule('userName', {
                type: Model.TYPE_STRING,
                description: 'User Name.',
                default: '',
                example: 'John Doe',
            })
            .addRule('mode', {
                type: Model.TYPE_STRING,
                description: 'API mode when event triggered.',
                default: '',
                example: 'admin',
            })
            .addRule('ip', {
                type: Model.TYPE_STRING,
                description: 'IP session in use when the session was created.',
                default: '',
                example: '127.0.0.1',
            })
            .addRule('time', {
                type: Model.TYPE_DATETIME,
                description: 'Log creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
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
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Log';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_LOG;
    }
}