import { Response } from '../../Response';
import { Model } from '../Model';

export class AuthProvider extends Model {
    protected public: boolean = false;

    constructor() {
        super();

        this
            .addRule('key', {
                type: Model.TYPE_STRING,
                description: 'Auth Provider.',
                default: '',
                example: 'github',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Auth Provider name.',
                default: '',
                example: 'GitHub',
            })
            .addRule('appId', {
                type: Model.TYPE_STRING,
                description: 'OAuth 2.0 application ID.',
                default: '',
                example: '259125845563242502',
            })
            .addRule('secret', {
                type: Model.TYPE_STRING,
                description: 'OAuth 2.0 application secret. Might be JSON string if provider requires extra configuration.',
                default: '',
                example: 'Bpw_g9c2TGXxfgLshDbSaL8tsCcqgczQ',
            })
            .addRule('enabled', {
                type: Model.TYPE_BOOLEAN,
                description: 'Auth Provider is active and can be used to create session.',
                example: '',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'AuthProvider';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_AUTH_PROVIDER;
    }
}
