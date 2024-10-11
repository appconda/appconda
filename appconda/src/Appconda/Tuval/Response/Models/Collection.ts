import { Response } from '../../Response';
import { Model } from '../Model';

export class Collection extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Collection ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Collection creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Collection update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$permissions', {
                type: Model.TYPE_STRING,
                description: 'Collection permissions. [Learn more about permissions](https://appconda.io/docs/permissions).',
                default: '',
                example: ['read("any")'],
                array: true,
            })
            .addRule('databaseId', {
                type: Model.TYPE_STRING,
                description: 'Database ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Collection name.',
                default: '',
                example: 'My Collection',
            })
            .addRule('enabled', {
                type: Model.TYPE_BOOLEAN,
                description: 'Collection enabled. Can be \'enabled\' or \'disabled\'. When disabled, the collection is inaccessible to users, but remains accessible to Server SDKs using API keys.',
                default: true,
                example: false,
            })
            .addRule('documentSecurity', {
                type: Model.TYPE_BOOLEAN,
                description: 'Whether document-level permissions are enabled. [Learn more about permissions](https://appconda.io/docs/permissions).',
                default: '',
                example: true,
            })
            .addRule('attributes', {
                type: [
                    Response.MODEL_ATTRIBUTE_BOOLEAN,
                    Response.MODEL_ATTRIBUTE_INTEGER,
                    Response.MODEL_ATTRIBUTE_FLOAT,
                    Response.MODEL_ATTRIBUTE_EMAIL,
                    Response.MODEL_ATTRIBUTE_ENUM,
                    Response.MODEL_ATTRIBUTE_URL,
                    Response.MODEL_ATTRIBUTE_IP,
                    Response.MODEL_ATTRIBUTE_DATETIME,
                    Response.MODEL_ATTRIBUTE_RELATIONSHIP,
                    Response.MODEL_ATTRIBUTE_STRING, // needs to be last, since its condition would dominate any other string attribute
                ],
                description: 'Collection attributes.',
                default: [],
                example: {},
                array: true,
            })
            .addRule('indexes', {
                type: Response.MODEL_INDEX,
                description: 'Collection indexes.',
                default: [],
                example: {},
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Collection';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_COLLECTION;
    }
}
