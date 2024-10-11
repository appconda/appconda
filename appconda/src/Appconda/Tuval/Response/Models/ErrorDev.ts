import { Response } from '../../Response';
import { ErrorModel } from './Error';

export class ErrorDev extends ErrorModel {
    protected public: boolean = false;

    constructor() {
        super();

        this
            .addRule('file', {
                type: ErrorModel.TYPE_STRING,
                description: 'File path.',
                default: '',
                example: '/usr/code/vendor/tuval/framework/src/App.php',
            })
            .addRule('line', {
                type: ErrorModel.TYPE_INTEGER,
                description: 'Line number.',
                default: 0,
                example: 209,
            })
            .addRule('trace', {
                type: ErrorModel.TYPE_STRING,
                description: 'Error trace.',
                default: [],
                example: '',
                array: true,
            });
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ERROR_DEV;
    }
}