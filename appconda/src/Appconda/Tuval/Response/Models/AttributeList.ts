
import { Response } from '../../Response';
import { Model } from '../Model';

export class AttributeList extends Model {
    constructor() {
        super();

        this
            .addRule('total', {
                type: Model.TYPE_INTEGER,
                description: 'Total number of attributes in the given collection.',
                default: 0,
                example: 5,
            })
            .addRule('attributes', {
                type: [
                    Response.MODEL_ATTRIBUTE_BOOLEAN,
                    Response.MODEL_ATTRIBUTE_INTEGER,
                    Response.MODEL_ATTRIBUTE_FLOAT,
                    Response.MODEL_ATTRIBUTE_EMAIL,
                    Response.MODEL_ATTRIBUTE_ENUM,
                    Response.MODEL_ATTRIBUTE_URL,
                    Response.MODEL_ATTRIBUTE_IP,
                    Response.MODEL_ATTRIBUTE_DATETIME,
                    Response.MODEL_ATTRIBUTE_RELATIONSHIP,
                    Response.MODEL_ATTRIBUTE_STRING // needs to be last, since its condition would dominate any other string attribute
                ],
                description: 'List of attributes.',
                default: [],
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Attributes List';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ATTRIBUTE_LIST;
    }
}
