import { Response } from '../../Response';
import { Model } from '../Model';

export class Migration extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Migration ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Variable creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Variable creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'Migration status ( pending, processing, failed, completed )',
                default: '',
                example: 'pending',
            })
            .addRule('stage', {
                type: Model.TYPE_STRING,
                description: 'Migration stage ( init, processing, source-check, destination-check, migrating, finished )',
                default: '',
                example: 'init',
            })
            .addRule('source', {
                type: Model.TYPE_STRING,
                description: 'A string containing the type of source of the migration.',
                default: '',
                example: 'Appconda',
            })
            .addRule('resources', {
                type: Model.TYPE_STRING,
                description: 'Resources to migration.',
                default: [],
                example: ['user'],
                array: true,
            })
            .addRule('statusCounters', {
                type: Model.TYPE_JSON,
                description: 'A group of counters that represent the total progress of the migration.',
                default: [],
                example: '{"Database": {"PENDING": 0, "SUCCESS": 1, "ERROR": 0, "SKIP": 0, "PROCESSING": 0, "WARNING": 0}}',
            })
            .addRule('resourceData', {
                type: Model.TYPE_JSON,
                description: 'An array of objects containing the report data of the resources that were migrated.',
                default: [],
                example: '[{"resource":"Database","id":"public","status":"SUCCESS","message":""}]',
            })
            .addRule('errors', {
                type: Model.TYPE_STRING,
                description: 'All errors that occurred during the migration process.',
                array: true,
                default: [],
                example: [],
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Migration';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MIGRATION;
    }
}
