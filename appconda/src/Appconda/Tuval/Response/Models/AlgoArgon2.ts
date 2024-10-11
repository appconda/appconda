
import { Response } from '../../Response';
import { Model } from '../Model';

export class AlgoArgon2 extends Model {
    constructor() {
        super();

        // No options if imported. If hashed by Appconda, following configuration is available:
        this
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Algo type.',
                default: 'argon2',
                example: 'argon2',
            })
            .addRule('memoryCost', {
                type: Model.TYPE_INTEGER,
                description: 'Memory used to compute hash.',
                default: '',
                example: 65536,
            })
            .addRule('timeCost', {
                type: Model.TYPE_INTEGER,
                description: 'Amount of time consumed to compute hash',
                default: '',
                example: 4,
            })
            .addRule('threads', {
                type: Model.TYPE_INTEGER,
                description: 'Number of threads used to compute hash.',
                default: '',
                example: 3,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AlgoArgon2';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ALGO_ARGON2;
    }
}
