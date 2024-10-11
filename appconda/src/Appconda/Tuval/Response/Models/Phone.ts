import { Response } from '../../Response';
import { Model } from '../Model';

export class Phone extends Model {
    constructor() {
        super();

        this
            .addRule('code', {
                type: Model.TYPE_STRING,
                description: 'Phone code.',
                default: '',
                example: '+1',
            })
            .addRule('countryCode', {
                type: Model.TYPE_STRING,
                description: 'Country two-character ISO 3166-1 alpha code.',
                default: '',
                example: 'US',
            })
            .addRule('countryName', {
                type: Model.TYPE_STRING,
                description: 'Country name.',
                default: '',
                example: 'United States',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Phone';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_PHONE;
    }
}
