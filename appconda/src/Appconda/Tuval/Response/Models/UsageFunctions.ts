import { Response } from '../../Response';
import { Model } from '../Model';

export class UsageFunctions extends Model {
    constructor() {
        super();

        this
            .addRule('range', {
                type: Model.TYPE_STRING,
                description: 'Time range of the usage stats.',
                default: '',
                example: '30d',
            })
            .addRule('functionsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of functions.',
                default: 0,
                example: 0,
            })
            .addRule('deploymentsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of functions deployments.',
                default: 0,
                example: 0,
            })
            .addRule('deploymentsStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of functions deployment storage.',
                default: 0,
                example: 0,
            })
            .addRule('buildsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of functions build.',
                default: 0,
                example: 0,
            })
            .addRule('buildsStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of functions build storage.',
                default: 0,
                example: 0,
            })
            .addRule('buildsTimeTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of functions build compute time.',
                default: 0,
                example: 0,
            })
            .addRule('buildsMbSecondsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of functions build mbSeconds.',
                default: 0,
                example: 0,
            })
            .addRule('executionsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of functions execution.',
                default: 0,
                example: 0,
            })
            .addRule('executionsTimeTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of functions execution compute time.',
                default: 0,
                example: 0,
            })
            .addRule('executionsMbSecondsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of functions execution mbSeconds.',
                default: 0,
                example: 0,
            })
            .addRule('functions', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of functions per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('deployments', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of functions deployment per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('deploymentsStorage', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of functions deployment storage per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('builds', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of functions build per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('buildsStorage', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated sum of functions build storage per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('buildsTime', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated sum of functions build compute time per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('buildsMbSeconds', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated sum of functions build mbSeconds per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executions', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of functions execution per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executionsTime', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of functions execution compute time per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executionsMbSeconds', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of functions mbSeconds per period.',
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
        return 'UsageFunctions';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USAGE_FUNCTIONS;
    }
}
