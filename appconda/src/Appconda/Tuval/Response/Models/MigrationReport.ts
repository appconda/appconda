import { Response } from '../../Response';
import { Model } from '../Model';

export class MigrationReport extends Model {
    constructor() {
        super();

      /*   this
            .addRule(Resource.TYPE_USER, {
                type: Model.TYPE_INTEGER,
                description: 'Number of users to be migrated.',
                default: 0,
                example: 20,
            })
            .addRule(Resource.TYPE_TEAM, {
                type: Model.TYPE_INTEGER,
                description: 'Number of teams to be migrated.',
                default: 0,
                example: 20,
            })
            .addRule(Resource.TYPE_DATABASE, {
                type: Model.TYPE_INTEGER,
                description: 'Number of databases to be migrated.',
                default: 0,
                example: 20,
            })
            .addRule(Resource.TYPE_DOCUMENT, {
                type: Model.TYPE_INTEGER,
                description: 'Number of documents to be migrated.',
                default: 0,
                example: 20,
            })
            .addRule(Resource.TYPE_FILE, {
                type: Model.TYPE_INTEGER,
                description: 'Number of files to be migrated.',
                default: 0,
                example: 20,
            })
            .addRule(Resource.TYPE_BUCKET, {
                type: Model.TYPE_INTEGER,
                description: 'Number of buckets to be migrated.',
                default: 0,
                example: 20,
            })
            .addRule(Resource.TYPE_FUNCTION, {
                type: Model.TYPE_INTEGER,
                description: 'Number of functions to be migrated.',
                default: 0,
                example: 20,
            })
            .addRule('size', {
                type: Model.TYPE_INTEGER,
                description: 'Size of files to be migrated in mb.',
                default: 0,
                example: 30000,
            })
            .addRule('version', {
                type: Model.TYPE_STRING,
                description: 'Version of the Appconda instance to be migrated.',
                default: '',
                example: '1.4.0',
            }); */
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Migration Report';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MIGRATION_REPORT;
    }
}
