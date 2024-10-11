import { Model } from '../Model';

export abstract class Template extends Model {
    constructor() {
        super();

        this
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Template type',
                default: '',
                example: 'verification',
            })
            .addRule('locale', {
                type: Model.TYPE_STRING,
                description: 'Template locale',
                default: '',
                example: 'en_us',
            })
            .addRule('message', {
                type: Model.TYPE_STRING,
                description: 'Template message',
                default: '',
                example: 'Click on the link to verify your account.',
            });
    }
}
