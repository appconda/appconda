import { Response } from '../../Response';
import { Model } from '../Model';

export class Country extends Model {
    constructor() {
        super();

        this
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Country name.',
                default: '',
                example: 'United States',
            })
            .addRule('code', {
                type: Model.TYPE_STRING,
                description: 'Country two-character ISO 3166-1 alpha code.',
                default: '',
                example: 'US',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Country';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_COUNTRY;
    }
}
