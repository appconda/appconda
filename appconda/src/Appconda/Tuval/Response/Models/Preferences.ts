import { Response } from '../../Response';
import { Any } from './Any';

export class Preferences extends Any {
    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Preferences';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_PREFERENCES;
    }
}
