import { Response } from '../../Response';
import { Model } from '../Model';

export class Rule extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Rule ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Rule creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Rule update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('domain', {
                type: Model.TYPE_STRING,
                description: 'Domain name.',
                default: '',
                example: 'appconda.company.com',
            })
            .addRule('resourceType', {
                type: Model.TYPE_STRING,
                description: 'Action definition for the rule. Possible values are "api", "function", or "redirect"',
                default: '',
                example: 'function',
            })
            .addRule('resourceId', {
                type: Model.TYPE_STRING,
                description: 'ID of resource for the action type. If resourceType is "api" or "url", it is empty. If resourceType is "function", it is ID of the function.',
                default: '',
                example: 'myAwesomeFunction',
            })
            .addRule('status', {
                type: Model.TYPE_STRING,
                description: 'Domain verification status. Possible values are "created", "verifying", "verified" and "unverified"',
                default: '',
                example: 'verified',
            })
            .addRule('logs', {
                type: Model.TYPE_STRING,
                description: 'Certificate generation logs. This will return an empty string if generation did not run, or succeeded.',
                default: '',
                example: 'HTTP challenge failed.',
            })
            .addRule('renewAt', {
                type: Model.TYPE_DATETIME,
                description: 'Certificate auto-renewal date in ISO 8601 format.',
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
        return 'Rule';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_PROXY_RULE;
    }
}
