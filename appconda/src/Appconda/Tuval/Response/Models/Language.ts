import { Response } from '../../Response';
import { Model } from '../Model';

export class Language extends Model {
    constructor() {
        super();

        this
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Language name.',
                default: '',
                example: 'Italian',
            })
            .addRule('code', {
                type: Model.TYPE_STRING,
                description: 'Language two-character ISO 639-1 codes.',
                default: '',
                example: 'it',
            })
            .addRule('nativeName', {
                type: Model.TYPE_STRING,
                description: 'Language native name.',
                default: '',
                example: 'Italiano',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Language';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_LANGUAGE;
    }
}
