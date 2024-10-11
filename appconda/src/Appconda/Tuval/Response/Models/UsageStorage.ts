import { Response } from '../../Response';
import { Model } from '../Model';

export class UsageStorage extends Model {
    constructor() {
        super();

        this
            .addRule('range', {
                type: Model.TYPE_STRING,
                description: 'Time range of the usage stats.',
                default: '',
                example: '30d',
            })
            .addRule('bucketsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of buckets',
                default: 0,
                example: 0,
            })
            .addRule('filesTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of files.',
                default: 0,
                example: 0,
            })
            .addRule('filesStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of files storage (in bytes).',
                default: 0,
                example: 0,
            })
            .addRule('buckets', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of buckets per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('files', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of files per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('storage', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of files storage (in bytes) per period.',
                default: [],
                example: [],
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'StorageUsage';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USAGE_STORAGE;
    }
}
