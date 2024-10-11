
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeString extends Attribute {
    constructor() {
        super();

        this
            .addRule('size', {
                type: Attribute.TYPE_INTEGER,
                description: 'Attribute size.',
                default: 0,
                example: 128,
            })
            .addRule('default', {
                type: Attribute.TYPE_STRING,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: 'default',
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_STRING,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeString';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_STRING;
    }
}
