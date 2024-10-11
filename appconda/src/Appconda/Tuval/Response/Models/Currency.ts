import { Response } from '../../Response';
import { Model } from '../Model';

export class Currency extends Model {
    constructor() {
        super();

        this
            .addRule('symbol', {
                type: Model.TYPE_STRING,
                description: 'Currency symbol.',
                default: '',
                example: '$',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Currency name.',
                default: '',
                example: 'US dollar',
            })
            .addRule('symbolNative', {
                type: Model.TYPE_STRING,
                description: 'Currency native symbol.',
                default: '',
                example: '$',
            })
            .addRule('decimalDigits', {
                type: Model.TYPE_INTEGER,
                description: 'Number of decimal digits.',
                default: 0,
                example: 2,
            })
            .addRule('rounding', {
                type: Model.TYPE_FLOAT,
                description: 'Currency digit rounding.',
                default: 0,
                example: 0,
            })
            .addRule('code', {
                type: Model.TYPE_STRING,
                description: 'Currency code in [ISO 4217-1](http://en.wikipedia.org/wiki/ISO_4217) three-character format.',
                default: '',
                example: 'USD',
            })
            .addRule('namePlural', {
                type: Model.TYPE_STRING,
                description: 'Currency plural name',
                default: '',
                example: 'US dollars',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Currency';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_CURRENCY;
    }
}
