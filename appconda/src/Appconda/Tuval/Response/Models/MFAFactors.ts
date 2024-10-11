import { Response } from '../../Response';
import { Model } from '../Model';
import { Type } from '../../../../Tuval/Auth';

export class MFAFactors extends Model {
    constructor() {
        super();

        this
            .addRule(Type.TOTP, {
                type: Model.TYPE_BOOLEAN,
                description: 'Can TOTP be used for MFA challenge for this account.',
                default: false,
                example: true,
            })
            .addRule(Type.PHONE, {
                type: Model.TYPE_BOOLEAN,
                description: 'Can phone (SMS) be used for MFA challenge for this account.',
                default: false,
                example: true,
            })
            .addRule(Type.EMAIL, {
                type: Model.TYPE_BOOLEAN,
                description: 'Can email be used for MFA challenge for this account.',
                default: false,
                example: true,
            })
            .addRule(Type.RECOVERY_CODE, {
                type: Model.TYPE_BOOLEAN,
                description: 'Can recovery code be used for MFA challenge for this account.',
                default: false,
                example: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'MFAFactors';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MFA_FACTORS;
    }
}
