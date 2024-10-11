import { Response } from '../../Response';
import { Model } from '../Model';

export class None extends Model {
    protected none: boolean = true;

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'None';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_NONE;
    }
}
