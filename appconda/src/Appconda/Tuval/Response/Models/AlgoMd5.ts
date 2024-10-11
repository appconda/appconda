
import { Response } from '../../Response';
import { Model } from '../Model';

class AlgoMd5 extends Model {
    constructor() {
        super();

        // No options, because this can only be imported, and verifying doesn't require any configuration
        this.addRule('type', {
            type: Model.TYPE_STRING,
            description: 'Algo type.',
            default: 'md5',
            example: 'md5',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AlgoMD5';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ALGO_MD5;
    }
}

export { AlgoMd5 };