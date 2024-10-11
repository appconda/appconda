import { Response } from '../../Response';
import { Model } from '../Model';

export class Token extends Model {
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
            .addRule('secret', {
                type: Model.TYPE_STRING,
                description: 'Token secret key. This will return an empty string unless the response is returned using an API key or as part of a webhook payload.',
                default: '',
                example: '',
            })
            .addRule('expire', {
                type: Model.TYPE_DATETIME,
                description: 'Token expiration date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('phrase', {
                type: Model.TYPE_STRING,
                description: 'Security phrase of a token. Empty if security phrase was not requested when creating a token. It includes randomly generated phrase which is also sent in the external resource such as email.',
                default: '',
                example: 'Golden Fox',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Token';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_TOKEN;
    }
}
