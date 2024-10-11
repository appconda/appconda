import { Response } from '../../Response';
import { Model } from '../Model';

export class UsageUsers extends Model {
    constructor() {
        super();

        this
            .addRule('range', {
                type: Model.TYPE_STRING,
                description: 'Time range of the usage stats.',
                default: '',
                example: '30d',
            })
            .addRule('usersTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of statistics of users.',
                default: 0,
                example: 0,
            })
            .addRule('sessionsTotal', {
                type: Model.TYPE_INTEGER,
                description: 'Total aggregated number of active sessions.',
                default: 0,
                example: 0,
            })
            .addRule('users', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of users per period.',
                default: [],
                example: [],
                array: true,
            })
            .addRule('sessions', {
                type: Response.MODEL_METRIC,
                description: 'Aggregated number of active sessions per period.',
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
        return 'UsageUsers';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USAGE_USERS;
    }
}
