import { Response } from '../../Response';
import { Model } from '../Model';

export class Identity extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Identity ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Identity creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Identity update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('userId', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '5e5bb8c16897e',
            })
            .addRule('provider', {
                type: Model.TYPE_STRING,
                description: 'Identity Provider.',
                default: '',
                example: 'email',
            })
            .addRule('providerUid', {
                type: Model.TYPE_STRING,
                description: 'ID of the User in the Identity Provider.',
                default: '',
                example: '5e5bb8c16897e',
            })
            .addRule('providerEmail', {
                type: Model.TYPE_STRING,
                description: 'Email of the User in the Identity Provider.',
                default: '',
                example: 'user@example.com',
            })
            .addRule('providerAccessToken', {
                type: Model.TYPE_STRING,
                description: 'Identity Provider Access Token.',
                default: '',
                example: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3',
            })
            .addRule('providerAccessTokenExpiry', {
                type: Model.TYPE_DATETIME,
                description: 'The date of when the access token expires in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('providerRefreshToken', {
                type: Model.TYPE_STRING,
                description: 'Identity Provider Refresh Token.',
                default: '',
                example: 'MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Identity';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_IDENTITY;
    }
}
