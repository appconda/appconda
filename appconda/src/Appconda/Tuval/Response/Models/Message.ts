import { DateTime } from '../../../../Tuval/Core';
import { Response } from '../../Response';
import { Model } from '../Model';

export class Message extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Message ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Message creation time in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Message update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('providerType', {
                type: Model.TYPE_STRING,
                description: 'Message provider type.',
                default: '',
                example: 'MESSAGE_TYPE_EMAIL',
            })
            .addRule('topics', {
                type: Model.TYPE_STRING,
                description: 'Topic IDs set as recipients.',
                default: '',
                array: true,
                example: ['5e5ea5c16897e'],
            })
            .addRule('users', {
                type: Model.TYPE_STRING,
                description: 'User IDs set as recipients.',
                default: '',
                array: true,
                example: ['5e5ea5c16897e'],
            })
            .addRule('targets', {
                type: Model.TYPE_STRING,
                description: 'Target IDs set as recipients.',
                default: '',
                array: true,
                example: ['5e5ea5c16897e'],
            })
            .addRule('scheduledAt', {
                type: Model.TYPE_DATETIME,
                description: 'The scheduled time for message.',
                required: false,
                default: DateTime.now(),
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('deliveredAt', {
                type: Model.TYPE_DATETIME,
                description: 'The time when the message was delivered.',
                required: false,
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('deliveryErrors', {
                type: Model.TYPE_STRING,
                description: 'Delivery errors if any.',
                required: false,
                default: '',
                array: true,
                example: ['Failed to send message to target 5e5ea5c16897e: Credentials not valid.'],
            })
            .addRule('deliveredTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Number of recipients the message was delivered to.',
                default: 0,
                example: 1,
            })
            .addRule('data', {
                type: Model.TYPE_JSON,
                description: 'Data of the message.',
                default: [],
                example: {
                    subject: 'Welcome to Appconda',
                    content: 'Hi there, welcome to Appconda family.',
                },
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'Status of delivery.',
                default: 'draft',
                example: 'Message status can be one of the following: draft, processing, scheduled, sent, or failed.',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Message';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_MESSAGE;
    }
}
