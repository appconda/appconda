import { Response } from '../../Response';
import { Model } from '../Model';

export class Topic extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Topic ID.',
                default: '',
                example: '259125845563242502',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Topic creation time in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Topic update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'The name of the topic.',
                default: '',
                example: 'events',
            })
            .addRule('emailTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total count of email subscribers subscribed to the topic.',
                default: 0,
                example: 100,
            })
            .addRule('smsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total count of SMS subscribers subscribed to the topic.',
                default: 0,
                example: 100,
            })
            .addRule('pushTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total count of push subscribers subscribed to the topic.',
                default: 0,
                example: 100,
            })
            .addRule('subscribe', {
                type: Model.TYPE_STRING,
                description: 'Subscribe permissions.',
                default: ['users'],
                example: 'users',
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Topic';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_TOPIC;
    }
}
