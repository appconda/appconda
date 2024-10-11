import { Response } from '../../Response';
import { Model } from '../Model';

export class HealthVersion extends Model {
    constructor() {
        super();

        this.addRule('version', {
            type: Model.TYPE_STRING,
            description: 'Version of the Appconda instance.',
            default: '',
            example: '0.11.0',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Health Version';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_HEALTH_VERSION;
    }
}
