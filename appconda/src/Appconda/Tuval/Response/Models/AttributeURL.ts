import { APP_DATABASE_ATTRIBUTE_URL } from '../../../../app/init';
import { Response } from '../../Response';

import { Attribute } from './Attribute';

export class AttributeURL extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'githubUrl',
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
                default: APP_DATABASE_ATTRIBUTE_URL,
                example: APP_DATABASE_ATTRIBUTE_URL,
            })
            .addRule('default', {
                type: Attribute.TYPE_STRING,
                description: 'Default value for attribute when not provided. Cannot be set when attribute is required.',
                default: null,
                required: false,
                example: 'http://example.com',
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_STRING,
        format: APP_DATABASE_ATTRIBUTE_URL,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeURL';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_URL;
    }
}
