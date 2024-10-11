
import { APP_DATABASE_ATTRIBUTE_ENUM } from '../../../../app/init';
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeEnum extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'status',
            })
            .addRule('type', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute type.',
                default: '',
                example: 'string',
            })
            .addRule('elements', {
                type: Attribute.TYPE_STRING,
                description: 'Array of elements in enumerated type.',
                default: null,
                example: 'element',
                array: true,
            })
            .addRule('format', {
                type: Attribute.TYPE_STRING,
                description: 'String format.',
                default: APP_DATABASE_ATTRIBUTE_ENUM,
                example: APP_DATABASE_ATTRIBUTE_ENUM,
            })
            .addRule('default', {
                type: Attribute.TYPE_STRING,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: 'element',
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_STRING,
        format: APP_DATABASE_ATTRIBUTE_ENUM,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeEnum';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_ENUM;
    }
}
