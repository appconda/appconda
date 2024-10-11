
import { Response } from '../../Response';
import { Model } from '../Model';

export class Provider extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Provider ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Provider creation time in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Provider update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'The name for the provider instance.',
                default: '',
                example: 'Mailgun',
            })
            .addRule('provider', {
                type: Model.TYPE_STRING,
                description: 'The name of the provider service.',
                default: '',
                example: 'mailgun',
            })
            .addRule('enabled', {
                type: Model.TYPE_BOOLEAN,
                description: 'Is provider enabled?',
                default: true,
                example: true,
            })
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Type of provider.',
                default: '',
                example: 'MESSAGE_TYPE_SMS',
            })
            .addRule('credentials', {
                type: Model.TYPE_JSON,
                description: 'Provider credentials.',
                default: [],
                example: {
                    key: '123456789',
                },
            })
            .addRule('options', {
                type: Model.TYPE_JSON,
                description: 'Provider options.',
                default: [],
                required: false,
                example: {
                    from: 'sender-email@mydomain',
                },
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Provider';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_PROVIDER;
    }
}
