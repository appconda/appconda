import { Response } from '../../Response';
import { Model } from '../Model';

export class MFAType extends Model {
    constructor() {
        super();

        this
            .addRule('secret', {
                type: Model.TYPE_STRING,
                description: 'Secret token used for TOTP factor.',
                default: '',
                example: true,
            })
            .addRule('uri', {
                type: Model.TYPE_STRING,
                description: 'URI for authenticator apps.',
                default: '',
                example: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'MFAType';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MFA_TYPE;
    }
}
