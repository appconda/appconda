
import { Response } from '../../Response';
import { Model } from '../Model';

export class Attribute extends Model {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Model.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'fullName',
            })
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Attribute type.',
                default: '',
                example: 'string',
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'Attribute status. Possible values: `available`, `processing`, `deleting`, `stuck`, or `failed`',
                default: '',
                example: 'available',
            })
            .addRule('error', {
                type: Model.TYPE_STRING,
                description: 'Error message. Displays error generated on failure of creating or deleting an attribute.',
                default: '',
                example: 'string',
            })
            .addRule('required', {
                type: Model.TYPE_BOOLEAN,
                description: 'Is attribute required?',
                default: false,
                example: true,
            })
            .addRule('array', {
                type: Model.TYPE_BOOLEAN,
                description: 'Is attribute an array?',
                default: false,
                required: false,
                example: false,
            });
    }

    public conditions: Record<string, any> = {};

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Attribute';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE;
    }
}
