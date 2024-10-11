import { APP_KEY_ACCCESS } from '../../../../app/init';
import { Response } from '../../Response';
import { Model } from '../Model';

export class Key extends Model {
    protected public: boolean = false;

    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Key ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Key creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Key update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Key name.',
                default: '',
                example: 'My API Key',
            })
            .addRule('expire', {
                type: Model.TYPE_DATETIME,
                description: 'Key expiration date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('scopes', {
                type: Model.TYPE_STRING,
                description: 'Allowed permission scopes.',
                default: [],
                example: 'users.read',
                array: true,
            })
            .addRule('secret', {
                type: Model.TYPE_STRING,
                description: 'Secret key.',
                default: '',
                example: '919c2d18fb5d4...a2ae413da83346ad2',
            })
            .addRule('accessedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Most recent access date in ISO 8601 format. This attribute is only updated again after ' + (APP_KEY_ACCCESS / 60 / 60) + ' hours.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('sdks', {
                type: Model.TYPE_STRING,
                description: 'List of SDK user agents that used this key.',
                default: null,
                example: 'appconda:flutter',
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Key';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_KEY;
    }
}
