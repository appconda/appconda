import { Response } from '../../Response';
import { Model } from '../Model';

export class MetricBreakdown extends Model {
    constructor() {
        super();

        this
            .addRule('resourceId', {
                type: Model.TYPE_STRING,
                description: 'Resource ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Resource name.',
                default: '',
                example: 'Documents',
            })
            .addRule('value', {
                type: Model.TYPE_INTEGER,
                description: 'The value of this metric at the timestamp.',
                default: 0,
                example: 1,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Metric Breakdown';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_METRIC_BREAKDOWN;
    }
}
