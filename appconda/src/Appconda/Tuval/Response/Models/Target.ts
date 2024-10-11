import { Response } from '../../Response';
import { Model } from '../Model';

export class Target extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Target ID.',
                default: '',
                example: '259125845563242502',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Target creation time in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Target update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Target Name.',
                default: '',
                example: 'Aegon apple token',
            })
            .addRule('userId', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '259125845563242502',
            })
            .addRule('providerId', {
                type: Model.TYPE_STRING,
                description: 'Provider ID.',
                required: false,
                default: '',
                example: '259125845563242502',
            })
            .addRule('providerType', {
                type: Model.TYPE_STRING,
                description: 'The target provider type. Can be one of the following: `email`, `sms` or `push`.',
                default: '',
                example: 'email',
            })
            .addRule('identifier', {
                type: Model.TYPE_STRING,
                description: 'The target identifier.',
                default: '',
                example: 'token',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Target';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_TARGET;
    }
}
