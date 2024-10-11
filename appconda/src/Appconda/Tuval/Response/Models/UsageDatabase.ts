import { Response } from '../../Response';
import { Model } from '../Model';

export class UsageDatabase extends Model {
    constructor() {
        super();

        this
            .addRule('range', {
                type: Model.TYPE_STRING,
                description: 'Time range of the usage stats.',
                default: '',
                example: '30d',
            })
            .addRule('collectionsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of collections.',
                default: 0,
                example: 0,
            })
            .addRule('documentsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of documents.',
                default: 0,
                example: 0,
            })
            .addRule('collections', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of collections per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('documents', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of documents per period.',
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
        return 'UsageDatabase';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USAGE_DATABASE;
    }
}
