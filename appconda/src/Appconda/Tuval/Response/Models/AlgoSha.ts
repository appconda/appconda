
import { Response } from '../../Response';
import { Model } from '../Model';

export class AlgoSha extends Model {
    constructor() {
        super();

        // No options, because this can only be imported, and verifying doesn't require any configuration
        this.addRule('type', {
            type: Model.TYPE_STRING,
            description: 'Algo type.',
            default: 'sha',
            example: 'sha',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AlgoSHA';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ALGO_SHA;
    }
}
