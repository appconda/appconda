import { Response } from '../../Response';
import { Model } from '../Model';

export class ErrorModel extends Model {
    constructor() {
        super();

        this
            .addRule('message', {
                type: Model.TYPE_STRING,
                description: 'Error message.',
                default: '',
                example: 'Not found',
            })
            .addRule('code', {
                type: Model.TYPE_STRING,
                description: 'Error code.',
                default: '',
                example: '404',
            })
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Error type. You can learn more about all the error types at https://appconda.io/docs/error-codes#errorTypes',
                default: 'unknown',
                example: 'not_found',
            })
            .addRule('version', {
                type: Model.TYPE_STRING,
                description: 'Server version number.',
                default: '',
                example: '1.0',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Error';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ERROR;
    }
}
