
import { APP_DATABASE_ATTRIBUTE_DATETIME } from '../../../../app/init';
import { Response } from '../../Response';
import { Attribute } from './Attribute';

export class AttributeDatetime extends Attribute {
    constructor() {
        super();

        this
            .addRule('key', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute Key.',
                default: '',
                example: 'birthDay',
            })
            .addRule('type', {
                type: Attribute.TYPE_STRING,
                description: 'Attribute type.',
                default: '',
                example: Attribute.TYPE_DATETIME,
            })
            .addRule('format', {
                type: Attribute.TYPE_DATETIME,
                description: 'ISO 8601 format.',
                default: APP_DATABASE_ATTRIBUTE_DATETIME,
                example: APP_DATABASE_ATTRIBUTE_DATETIME,
                array: false,
            })
            .addRule('default', {
                type: Attribute.TYPE_STRING,
                description: 'Default value for attribute when not provided. Only null is optional',
                default: null,
                example: Attribute.TYPE_DATETIME_EXAMPLE,
                array: false,
                required: false,
            });
    }

    public conditions: Record<string, any> = {
        type: Attribute.TYPE_DATETIME,
    };

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AttributeDatetime';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_DATETIME;
    }
}
