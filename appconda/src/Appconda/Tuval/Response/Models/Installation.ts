import { Response } from '../../Response';
import { Model } from '../Model';

export class Installation extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Function ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Function creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Function update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('provider', {
                type: Model.TYPE_STRING,
                description: 'VCS (Version Control System) provider name.',
                default: [],
                example: 'github',
                array: false,
            })
            .addRule('organization', {
                type: Model.TYPE_STRING,
                description: 'VCS (Version Control System) organization name.',
                default: [],
                example: 'appconda',
                array: false,
            })
            .addRule('providerInstallationId', {
                type: Model.TYPE_STRING,
                description: 'VCS (Version Control System) installation ID.',
                default: '',
                example: '5322',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Installation';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_INSTALLATION;
    }
}
