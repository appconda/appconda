import { Role } from '../../../../Tuval/Core';
import { Response } from '../../Response';
import { Model } from '../Model';

export class Execution extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Execution ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Execution creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Execution update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$permissions', {
                type: Model.TYPE_STRING,
                description: 'Execution roles.',
                default: '',
                example: [Role.any().toString()],
                array: true,
            })
            .addRule('functionId', {
                type: Model.TYPE_STRING,
                description: 'Function ID.',
                default: '',
                example: '5e5ea6g16897e',
            })
            .addRule('trigger', {
                type: Model.TYPE_STRING,
                description: 'The trigger that caused the function to execute. Possible values can be: `http`, `schedule`, or `event`.',
                default: '',
                example: 'http',
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'The status of the function execution. Possible values can be: `waiting`, `processing`, `completed`, or `failed`.',
                default: '',
                example: 'processing',
            })
            .addRule('requestMethod', {
                type: Model.TYPE_STRING,
                description: 'HTTP request method type.',
                default: '',
                example: 'GET',
            })
            .addRule('requestPath', {
                type: Model.TYPE_STRING,
                description: 'HTTP request path and query.',
                default: '',
                example: '/articles?id=5',
            })
            .addRule('requestHeaders', {
                type: Response.MODEL_HEADERS,
                description: 'HTTP response headers as a key-value object. This will return only whitelisted headers. All headers are returned if execution is created as synchronous.',
                default: [],
                example: [{ 'Content-Type': 'application/json' }],
                array: true,
            })
            .addRule('responseStatusCode', {
                type: Model.TYPE_INTEGER,
                description: 'HTTP response status code.',
                default: 0,
                example: 200,
            })
            .addRule('responseBody', {
                type: Model.TYPE_STRING,
                description: 'HTTP response body. This will return empty unless execution is created as synchronous.',
                default: '',
                example: 'Developers are awesome.',
            })
            .addRule('responseHeaders', {
                type: Response.MODEL_HEADERS,
                description: 'HTTP response headers as a key-value object. This will return only whitelisted headers. All headers are returned if execution is created as synchronous.',
                default: [],
                example: [{'Content-Type' : 'application/json'}],
                array: true,
            })
            .addRule('logs', {
                type: Model.TYPE_STRING,
                description: 'Function logs. Includes the last 4,000 characters. This will return an empty string unless the response is returned using an API key or as part of a webhook payload.',
                default: '',
                example: '',
            })
            .addRule('errors', {
                type: Model.TYPE_STRING,
                description: 'Function errors. Includes the last 4,000 characters. This will return an empty string unless the response is returned using an API key or as part of a webhook payload.',
                default: '',
                example: '',
            })
            .addRule('duration', {
                type: Model.TYPE_FLOAT,
                description: 'Function execution duration in seconds.',
                default: 0,
                example: 0.400,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Execution';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_EXECUTION;
    }
}
