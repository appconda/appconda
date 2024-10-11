import { Response } from '../../Response';
import { Model } from '../Model';

export class Membership extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Membership ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Membership creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Membership update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('userId', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('userName', {
                type: Model.TYPE_STRING,
                description: 'User name.',
                default: '',
                example: 'John Doe',
            })
            .addRule('userEmail', {
                type: Model.TYPE_STRING,
                description: 'User email address.',
                default: '',
                example: 'john@appconda.io',
            })
            .addRule('teamId', {
                type: Model.TYPE_STRING,
                description: 'Team ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('teamName', {
                type: Model.TYPE_STRING,
                description: 'Team name.',
                default: '',
                example: 'VIP',
            })
            .addRule('invited', {
                type: Model.TYPE_DATETIME,
                description: 'Date, the user has been invited to join the team in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('joined', {
                type: Model.TYPE_DATETIME,
                description: 'Date, the user has accepted the invitation to join the team in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('confirm', {
                type: Model.TYPE_BOOLEAN,
                description: 'User confirmation status, true if the user has joined the team or false otherwise.',
                default: false,
                example: false,
            })
            .addRule('mfa', {
                type: Model.TYPE_BOOLEAN,
                description: 'Multi factor authentication status, true if the user has MFA enabled or false otherwise.',
                default: false,
                example: false,
            })
            .addRule('roles', {
                type: Model.TYPE_STRING,
                description: 'User list of roles',
                default: [],
                example: ['owner'],
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Membership';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MEMBERSHIP;
    }
}
