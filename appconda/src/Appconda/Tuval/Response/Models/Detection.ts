import { Response } from '../../Response';
import { Model } from '../Model';

export class Detection extends Model {
    constructor() {
        super();

        this.addRule('runtime', {
            type: Model.TYPE_STRING,
            description: 'Runtime',
            default: '',
            example: 'node',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Detection';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_DETECTION;
    }
}
