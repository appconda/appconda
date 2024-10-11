import { Response } from '../../Response';
import { Model } from '../Model';

export class Subscriber extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Subscriber ID.',
                default: '',
                example: '259125845563242502',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Subscriber creation time in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Subscriber update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('targetId', {
                type: Model.TYPE_STRING,
                description: 'Target ID.',
                default: '',
                example: '259125845563242502',
            })
            .addRule('target', {
                type: Response.MODEL_TARGET,
                description: 'Target.',
                default: {},
                example: {
                    $id: '259125845563242502',
                    $createdAt: Model.TYPE_DATETIME_EXAMPLE,
                    $updatedAt: Model.TYPE_DATETIME_EXAMPLE,
                    providerType: 'email',
                    providerId: '259125845563242502',
                    name: 'ageon-app-email',
                    identifier: 'random-mail@email.org',
                    userId: '5e5ea5c16897e',
                },
            })
            .addRule('userId', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('userName', {
                type: Model.TYPE_STRING,
                description: 'User Name.',
                default: '',
                example: 'Aegon Targaryen',
            })
            .addRule('topicId', {
                type: Model.TYPE_STRING,
                description: 'Topic ID.',
                default: '',
                example: '259125845563242502',
            })
            .addRule('providerType', {
                type: Model.TYPE_STRING,
                description: 'The target provider type. Can be one of the following: `email`, `sms` or `push`.',
                default: '',
                example: 'email',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Subscriber';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_SUBSCRIBER;
    }
}
