import { Response } from '../../Response';
import { Model } from '../Model';

export class MFARecoveryCodes extends Model {
    constructor() {
        super();

        this.addRule('recoveryCodes', {
            type: Model.TYPE_STRING,
            description: 'Recovery codes.',
            array: true,
            default: [],
            example: ['a3kf0-s0cl2', 's0co1-as98s'],
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'MFA Recovery Codes';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MFA_RECOVERY_CODES;
    }
}
