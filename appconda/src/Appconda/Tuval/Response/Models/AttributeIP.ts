
import { APP_DATABASE_ATTRIBUTE_IP } from '../../../../app/init';
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeIP extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'ipAddress',
            })
            .addRule('type', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute type.',
                default: '',
                example: 'string',
            })
            .addRule('format', {
                type: Attribute.TYPE_STRING,
                description: 'String format.',
                default: APP_DATABASE_ATTRIBUTE_IP,
                example: APP_DATABASE_ATTRIBUTE_IP,
            })
            .addRule('default', {
                type: Attribute.TYPE_STRING,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: '192.0.2.0',
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_STRING,
        format: APP_DATABASE_ATTRIBUTE_IP,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeIP';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_IP;
    }
}
