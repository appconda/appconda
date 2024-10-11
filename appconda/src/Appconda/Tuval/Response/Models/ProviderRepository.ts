import { Response } from '../../Response';
import { Model } from '../Model';

export class ProviderRepository extends Model {
    constructor() {
        super();

        this
            .addRule('id', {
                type: Model.TYPE_STRING,
                description: 'VCS (Version Control System) repository ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'VCS (Version Control System) repository name.',
                default: '',
                example: 'appconda',
            })
            .addRule('organization', {
                type: Model.TYPE_STRING,
                description: 'VCS (Version Control System) organization name',
                default: '',
                example: 'appconda',
                array: false,
            })
            .addRule('provider', {
                type: Model.TYPE_STRING,
                description: 'VCS (Version Control System) provider name.',
                default: '',
                example: 'github',
            })
            .addRule('private', {
                type: Model.TYPE_BOOLEAN,
                description: 'Is VCS (Version Control System) repository private?',
                default: false,
                example: true,
            })
            .addRule('runtime', {
                type: Model.TYPE_STRING,
                description: 'Auto-detected runtime suggestion. Empty if getting response of getRuntime().',
                default: '',
                example: 'node',
            })
            .addRule('pushedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Last commit date in ISO 8601 format.',
                default: Model.TYPE_DATETIME_EXAMPLE,
                example: Model.TYPE_DATETIME_EXAMPLE,
                array: false,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'ProviderRepository';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_PROVIDER_REPOSITORY;
    }
}
