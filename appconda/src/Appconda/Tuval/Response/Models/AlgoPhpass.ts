
import { Response } from '../../Response';
import { Model } from '../Model';

export class AlgoPhpass extends Model {
    constructor() {
        super();

        // No options, because this can only be imported, and verifying doesn't require any configuration
        this.addRule('type', {
            type: Model.TYPE_STRING,
            description: 'Algo type.',
            default: 'phpass',
            example: 'phpass',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AlgoPHPass';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ALGO_PHPASS;
    }
}
