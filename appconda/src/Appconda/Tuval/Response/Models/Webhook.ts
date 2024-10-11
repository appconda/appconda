import { Response } from '../../Response';
import { Model } from '../Model';

export class Webhook extends Model {
    protected public: boolean = false;

    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Webhook ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Webhook creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Webhook update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Webhook name.',
                default: '',
                example: 'My Webhook',
            })
            .addRule('url', {
                type: Model.TYPE_STRING,
                description: 'Webhook URL endpoint.',
                default: '',
                example: 'https://example.com/webhook',
            })
            .addRule('events', {
                type: Model.TYPE_STRING,
                description: 'Webhook trigger events.',
                default: [],
                example: 'database.collections.update',
                array: true,
            })
            .addRule('security', {
                type: Model.TYPE_BOOLEAN,
                description: 'Indicated if SSL / TLS Certificate verification is enabled.',
                default: true,
                example: true,
            })
            .addRule('httpUser', {
                type: Model.TYPE_STRING,
                description: 'HTTP basic authentication username.',
                default: '',
                example: 'username',
            })
            .addRule('httpPass', {
                type: Model.TYPE_STRING,
                description: 'HTTP basic authentication password.',
                default: '',
                example: 'password',
            })
            .addRule('signatureKey', {
                type: Model.TYPE_STRING,
                description: 'Signature key which can be used to validated incoming',
                default: '',
                example: 'ad3d581ca230e2b7059c545e5a',
            })
            .addRule('enabled', {
                type: Model.TYPE_BOOLEAN,
                description: 'Indicates if this webhook is enabled.',
                default: true,
                example: true,
            })
            .addRule('logs', {
                type: Model.TYPE_STRING,
                description: 'Webhook error logs from the most recent failure.',
                default: '',
                example: 'Failed to connect to remote server.',
            })
            .addRule('attempts', {
                type: Model.TYPE_INTEGER,
                description: 'Number of consecutive failed webhook attempts.',
                default: 0,
                example: 10,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Webhook';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_WEBHOOK;
    }
}
