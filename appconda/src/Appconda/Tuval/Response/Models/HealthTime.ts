import { Response } from '../../Response';
import { Model } from '../Model';

export class HealthTime extends Model {
    constructor() {
        super();

        this
            .addRule('remoteTime', {
                type: Model.TYPE_INTEGER,
                description: 'Current unix timestamp on trustful remote server.',
                default: 0,
                example: 1639490751,
            })
            .addRule('localTime', {
                type: Model.TYPE_INTEGER,
                description: 'Current unix timestamp of local server where Appconda runs.',
                default: 0,
                example: 1639490844,
            })
            .addRule('diff', {
                type: Model.TYPE_INTEGER,
                description: 'Difference of unix remote and local timestamps in milliseconds.',
                default: 0,
                example: 93,
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Health Time';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_HEALTH_TIME;
    }
}
