import { Response } from '../../Response';
import { Model } from '../Model';

export class Metric extends Model {
    constructor() {
        super();

        this
            .addRule('value', {
                type: Model.TYPE_INTEGER,
                description: 'The value of this metric at the timestamp.',
                default: -1,
                example: 1,
            })
            .addRule('date', {
                type: Model.TYPE_DATETIME,
                description: 'The date at which this metric was aggregated in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Metric';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_METRIC;
    }
}
