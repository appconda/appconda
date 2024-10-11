import { Response } from '../../Response';
import { Model } from '../Model';

export class Locale extends Model {
    constructor() {
        super();

        this
            .addRule('ip', {
                type: Model.TYPE_STRING,
                description: 'User IP address.',
                default: '',
                example: '127.0.0.1',
            })
            .addRule('countryCode', {
                type: Model.TYPE_STRING,
                description: 'Country code in [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1) two-character format',
                default: '',
                example: 'US',
            })
            .addRule('country', {
                type: Model.TYPE_STRING,
                description: 'Country name. This field supports localization.',
                default: '',
                example: 'United States',
            })
            .addRule('continentCode', {
                type: Model.TYPE_STRING,
                description: 'Continent code. A two character continent code "AF" for Africa, "AN" for Antarctica, "AS" for Asia, "EU" for Europe, "NA" for North America, "OC" for Oceania, and "SA" for South America.',
                default: '',
                example: 'NA',
            })
            .addRule('continent', {
                type: Model.TYPE_STRING,
                description: 'Continent name. This field supports localization.',
                default: '',
                example: 'North America',
            })
            .addRule('eu', {
                type: Model.TYPE_BOOLEAN,
                description: 'True if country is part of the European Union.',
                default: false,
                example: false,
            })
            .addRule('currency', {
                type: Model.TYPE_STRING,
                description: 'Currency code in [ISO 4217-1](http://en.wikipedia.org/wiki/ISO_4217) three-character format',
                default: '',
                example: 'USD',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Locale';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_LOCALE;
    }
}
