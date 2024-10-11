import { Response } from '../../Response';
import { Model } from '../Model';

export class UsageBuckets extends Model {
    constructor() {
        super();

        this
            .addRule('range', {
                type: Model.TYPE_STRING,
                description: 'Time range of the usage stats.',
                default: '',
                example: '30d',
            })
            .addRule('filesTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of bucket files.',
                default: 0,
                example: 0,
            })
            .addRule('filesStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of bucket files storage (in bytes).',
                default: 0,
                example: 0,
            })
            .addRule('files', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of bucket files per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('storage', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of bucket storage files (in bytes) per period.',
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
        return 'UsageBuckets';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USAGE_BUCKETS;
    }
}
