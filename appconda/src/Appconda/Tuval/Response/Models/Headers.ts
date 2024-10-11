import { Response } from '../../Response';
import { Model } from '../Model';

export class Headers extends Model {
    constructor() {
        super();

        this
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Header name.',
                default: '',
                example: 'Content-Type',
            })
            .addRule('value', {
                type: Model.TYPE_STRING,
                description: 'Header value.',
                default: '',
                example: 'application/json',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Headers';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_HEADERS;
    }
}
