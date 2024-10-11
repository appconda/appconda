import { Response } from '../../Response';
import { Model } from '../Model';

export class HealthStatus extends Model {
    constructor() {
        super();

        this
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Name of the service.',
                default: '',
                example: 'database',
            })
            .addRule('ping', {
                type: Model.TYPE_INTEGER,
                description: 'Duration in milliseconds how long the health check took.',
                default: 0,
                example: 128,
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'Service status. Possible values can be: `pass`, `fail`',
                default: '',
                example: 'pass',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Health Status';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_HEALTH_STATUS;
    }
}
