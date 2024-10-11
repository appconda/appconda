
import { APP_DATABASE_ATTRIBUTE_EMAIL } from '../../../../app/init';
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeEmail extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'userEmail',
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
                default: APP_DATABASE_ATTRIBUTE_EMAIL,
                example: APP_DATABASE_ATTRIBUTE_EMAIL,
            })
            .addRule('default', {
                type: Attribute.TYPE_STRING,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: 'default@example.com',
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_STRING,
        format: APP_DATABASE_ATTRIBUTE_EMAIL,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeEmail';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_EMAIL;
    }
}
