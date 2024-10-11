import { Response } from '../../Response';
import { Model } from '../Model';

export class Mock extends Model {
    constructor() {
        super();

        this.addRule('result', {
            type: Model.TYPE_STRING,
            description: 'Result message.',
            default: '',
            example: 'Success',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Mock';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MOCK;
    }
}
