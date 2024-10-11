import { Response } from '../../Response';
import { Model } from '../Model';

export class Index extends Model {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Model.TYPE_STRING,
                description: 'Index Key.',
                default: '',
                example: 'index1',
            })
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Index type.',
                default: '',
                example: 'primary',
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'Index status. Possible values: `available`, `processing`, `deleting`, `stuck`, or `failed`',
                default: '',
                example: 'available',
            })
            .addRule('error', {
                type: Model.TYPE_STRING,
                description: 'Error message. Displays error generated on failure of creating or deleting an index.',
                default: '',
                example: 'string',
            })
            .addRule('attributes', {
                type: Model.TYPE_STRING,
                description: 'Index attributes.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('orders', {
                type: Model.TYPE_STRING,
                description: 'Index orders.',
                default: [],
                example: [],
                array: true,
                required: false,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Index';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_INDEX;
    }
}