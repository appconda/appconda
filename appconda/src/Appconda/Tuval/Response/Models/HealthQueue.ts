import { Response } from '../../Response';
import { Model } from '../Model';

export class HealthQueue extends Model {
    constructor() {
        super();

        this.addRule('size', {
            type: Model.TYPE_INTEGER,
            description: 'Amount of actions in the queue.',
            default: 0,
            example: 8,
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Health Queue';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_HEALTH_QUEUE;
    }
}