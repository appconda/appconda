import { Response } from '../../Response';
import { Model } from '../Model';

export class LocaleCode extends Model {
    constructor() {
        super();

        this
            .addRule('code', {
                type: Model.TYPE_STRING,
                description: 'Locale codes in [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)',
                default: '',
                example: 'en-us',
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Locale name',
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
        return 'LocaleCode';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_LOCALE_CODE;
    }
}
