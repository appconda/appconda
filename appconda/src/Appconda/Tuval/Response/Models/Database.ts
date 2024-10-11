import { Response } from '../../Response';
import { Model } from '../Model';

export class Database extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Database ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Database name.',
                default: '',
                example: 'My Database',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Database creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Database update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('enabled', {
                type: Model.TYPE_BOOLEAN,
                description: 'If database is enabled. Can be \'enabled\' or \'disabled\'. When disabled, the database is inaccessible to users, but remains accessible to Server SDKs using API keys.',
                default: true,
                example: false,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Database';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_DATABASE;
    }
}
