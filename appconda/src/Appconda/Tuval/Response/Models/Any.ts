
import { Response } from '../../Response';
import { Model } from '../Model';

export class Any extends Model {
    protected any: boolean = true;

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Any';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_ANY;
    }
}
