import { Response } from '../../Response';
import { Model } from '../Model';

export class MFAChallenge extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Token ID.',
                default: '',
                example: 'bb8ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Token creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('userId', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '5e5ea5c168bb8',
            })
            .addRule('expire', {
                type: Model.TYPE_DATETIME,
                description: 'Token expiration date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'MFA Challenge';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MFA_CHALLENGE;
    }
}
