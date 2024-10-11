
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeFloat extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'percentageCompleted',
            })
            .addRule('type', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute type.',
                default: '',
                example: 'double',
            })
            .addRule('min', {
                type: Attribute.TYPE_FLOAT,
                description: 'Minimum value to enforce for new documents.',
                default: null,
                required: false,
                example: 1.5,
            })
            .addRule('max', {
                type: Attribute.TYPE_FLOAT,
                description: 'Maximum value to enforce for new documents.',
                default: null,
                required: false,
                example: 10.5,
            })
            .addRule('default', {
                type: Attribute.TYPE_FLOAT,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: 2.5,
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_FLOAT,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeFloat';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_FLOAT;
    }
}
