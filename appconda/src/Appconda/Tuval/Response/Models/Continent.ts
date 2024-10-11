import { Response } from '../../Response';
import { Model } from '../Model';

export class Continent extends Model {
    constructor() {
        super();

        this
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Continent name.',
                default: '',
                example: 'Europe',
            })
            .addRule('code', {
                type: Model.TYPE_STRING,
                description: 'Continent two letter code.',
                default: '',
                example: 'EU',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Continent';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_CONTINENT;
    }
}
