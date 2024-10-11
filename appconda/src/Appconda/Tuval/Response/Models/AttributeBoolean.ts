
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeBoolean extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'isEnabled',
            })
            .addRule('type', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute type.',
                default: '',
                example: 'boolean',
            })
            .addRule('default', {
                type: Attribute.TYPE_BOOLEAN,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: false,
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_BOOLEAN,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeBoolean';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_BOOLEAN;
    }
}
