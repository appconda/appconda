import { Response } from '../../Response';
import { Model } from '../Model';

export class Variable extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Variable ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Variable creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Variable creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('key', {
                type: Model.TYPE_STRING,
                description: 'Variable key.',
                default: '',
                example: 'API_KEY',
                array: false,
            })
            .addRule('value', {
                type: Model.TYPE_STRING,
                description: 'Variable value.',
                default: '',
                example: 'myPa$$word1',
            })
            .addRule('resourceType', {
                type: Model.TYPE_STRING,
                description: 'Service to which the variable belongs. Possible values are "project", "function"',
                default: '',
                example: 'function',
            })
            .addRule('resourceId', {
                type: Model.TYPE_STRING,
                description: 'ID of resource to which the variable belongs. If resourceType is "project", it is empty. If resourceType is "function", it is ID of the function.',
                default: '',
                example: 'myAwesomeFunction',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Variable';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_VARIABLE;
    }
}
