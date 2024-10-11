import { Response } from '../../Response';
import { Model } from '../Model';

export class Branch extends Model {
    constructor() {
        super();

        this.addRule('name', {
            type: Model.TYPE_STRING,
            description: 'Branch Name.',
            default: '',
            example: 'main',
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Branch';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_BRANCH;
    }
}
