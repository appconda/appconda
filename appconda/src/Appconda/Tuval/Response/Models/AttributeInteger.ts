
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeInteger extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'count',
            })
            .addRule('type', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute type.',
                default: '',
                example: 'integer',
            })
            .addRule('min', {
                type: Attribute.TYPE_INTEGER,
                description: 'Minimum value to enforce for new documents.',
                default: null,
                required: false,
                example: 1,
            })
            .addRule('max', {
                type: Attribute.TYPE_INTEGER,
                description: 'Maximum value to enforce for new documents.',
                default: null,
                required: false,
                example: 10,
            })
            .addRule('default', {
                type: Attribute.TYPE_INTEGER,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: 10,
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_INTEGER,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeInteger';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_INTEGER;
    }
}
