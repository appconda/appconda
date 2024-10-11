import { Response } from '../../Response';
import { Model } from '../Model';

export class HealthAntivirus extends Model {
    constructor() {
        super();

        this
            .addRule('version', {
                type: Model.TYPE_STRING,
                description: 'Antivirus version.',
                default: '',
                example: '1.0.0',
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'Antivirus status. Possible values can be: `disabled`, `offline`, `online`',
                default: '',
                example: 'online',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Health Antivirus';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_HEALTH_ANTIVIRUS;
    }
}
