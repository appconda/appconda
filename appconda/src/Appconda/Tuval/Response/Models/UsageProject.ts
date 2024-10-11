import { Response } from '../../Response';
import { Model } from '../Model';

export class UsageProject extends Model {
    constructor() {
        super();

        this
            .addRule('executionsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of function executions.',
                default: 0,
                example: 0,
            })
            .addRule('documentsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of documents.',
                default: 0,
                example: 0,
            })
            .addRule('databasesTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of databases.',
                default: 0,
                example: 0,
            })
            .addRule('usersTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of users.',
                default: 0,
                example: 0,
            })
            .addRule('filesStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of files storage size (in bytes).',
                default: 0,
                example: 0,
            })
            .addRule('deploymentsStorageTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated sum of deployments storage size (in bytes).',
                default: 0,
                example: 0,
            })
            .addRule('bucketsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of buckets.',
                default: 0,
                example: 0,
            })
            .addRule('executionsMbSecondsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of function executions mbSeconds.',
                default: 0,
                example: 0,
            })
            .addRule('buildsMbSecondsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of function builds mbSeconds.',
                default: 0,
                example: 0,
            })
            .addRule('requests', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of requests per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('network', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of consumed bandwidth per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('users', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of users per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executions', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of executions per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executionsBreakdown', {
                type: Response.MODEL_METRIC_BREAKDOWN,
                description: 'Aggregated breakdown in totals of executions by functions.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('bucketsBreakdown', {
                type: Response.MODEL_METRIC_BREAKDOWN,
                description: 'Aggregated breakdown in totals of usage by buckets.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('executionsMbSecondsBreakdown', {
                type: Response.MODEL_METRIC_BREAKDOWN,
                description: 'Aggregated breakdown in totals of execution mbSeconds by functions.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('buildsMbSecondsBreakdown', {
                type: Response.MODEL_METRIC_BREAKDOWN,
                description: 'Aggregated breakdown in totals of build mbSeconds by functions.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('deploymentsStorageBreakdown', {
                type: Response.MODEL_METRIC_BREAKDOWN,
                description: 'Aggregated breakdown in totals of deployments storage size (in bytes).',
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
        return 'UsageProject';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USAGE_PROJECT;
    }
}
