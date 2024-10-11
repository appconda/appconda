
import { Response } from '../../Response';
import { Model } from '../Model';

export class AlgoScryptModified extends Model {
    constructor() {
        super();

        this
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Algo type.',
                default: 'scryptMod',
                example: 'scryptMod',
            })
            .addRule('salt', {
                type: Model.TYPE_STRING,
                description: 'Salt used to compute hash.',
                default: '',
                example: 'UxLMreBr6tYyjQ==',
            })
            .addRule('saltSeparator', {
                type: Model.TYPE_STRING,
                description: 'Separator used to compute hash.',
                default: '',
                example: 'Bw==',
            })
            .addRule('signerKey', {
                type: Model.TYPE_STRING,
                description: 'Key used to compute hash.',
                default: '',
                example: 'XyEKE9RcTDeLEsL/RjwPDBv/RqDl8fb3gpYEOQaPihbxf1ZAtSOHCjuAAa7Q3oHpCYhXSN9tizHgVOwn6krflQ==',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AlgoScryptModified';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ALGO_SCRYPT_MODIFIED;
    }
}
