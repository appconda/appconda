import { Response } from '../../Response';
import { Model } from '../Model';

export class UsageFunction extends Model {
    constructor() {
        super();

        this
            .addRule('range', {
                type: Model.TYPE_STRING,
                description: 'The time range of the usage stats.',
                default: '',
                example: '30d',
            })
            .addRule('deploymentsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of function deployments.',
                default: 0,
                example: 0,
            })
            .addRule('deploymentsStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of function deployments storage.',
                default: 0,
                example: 0,
            })
            .addRule('buildsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of function builds.',
                default: 0,
                example: 0,
            })
            .addRule('buildsStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of function builds storage.',
                default: 0,
                example: 0,
            })
            .addRule('buildsTimeTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of function builds compute time.',
                default: 0,
                example: 0,
            })
            .addRule('buildsMbSecondsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of function builds mbSeconds.',
                default: 0,
                example: 0,
            })
            .addRule('executionsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of function executions.',
                default: 0,
                example: 0,
            })
            .addRule('executionsTimeTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of function executions compute time.',
                default: 0,
                example: 0,
            })
            .addRule('executionsMbSecondsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of function executions mbSeconds.',
                default: 0,
                example: 0,
            })
            .addRule('deployments', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of function deployments per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('deploymentsStorage', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of function deployments storage per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('builds', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of function builds per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('buildsStorage', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated sum of function builds storage per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('buildsTime', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated sum of function builds compute time per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('buildsMbSeconds', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of function builds mbSeconds per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executions', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of function executions per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executionsTime', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of function executions compute time per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executionsMbSeconds', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of function executions mbSeconds per period.',
                default: [],
                example: [],
                array: true,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'UsageFunction';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USAGE_FUNCTION;
    }
}