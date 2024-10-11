
import { Response } from '../../Response';
import { Model } from '../Model';

export class AlgoScrypt extends Model {
    constructor() {
        super();

        this
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Algo type.',
                default: 'scrypt',
                example: 'scrypt',
            })
            .addRule('costCpu', {
                type: Model.TYPE_INTEGER,
                description: 'CPU complexity of computed hash.',
                default: 8,
                example: 8,
            })
            .addRule('costMemory', {
                type: Model.TYPE_INTEGER,
                description: 'Memory complexity of computed hash.',
                default: 14,
                example: 14,
            })
            .addRule('costParallel', {
                type: Model.TYPE_INTEGER,
                description: 'Parallelization of computed hash.',
                default: 1,
                example: 1,
            })
            .addRule('length', {
                type: Model.TYPE_INTEGER,
                description: 'Length used to compute hash.',
                default: 64,
                example: 64,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AlgoScrypt';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ALGO_SCRYPT;
    }
}