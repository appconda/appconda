import { Response } from '../../Response';
import { Template } from './Template';

export class TemplateEmail extends Template {
    constructor() {
        super();
        this
            .addRule('senderName', {
                type: Template.TYPE_STRING,
                description: 'Name of the sender',
                default: '',
                example: 'My User',
            })
            .addRule('senderEmail', {
                type: Template.TYPE_STRING,
                description: 'Email of the sender',
                default: '',
                example: 'mail@appconda.io',
            })
            .addRule('replyTo', {
                type: Template.TYPE_STRING,
                description: 'Reply to email address',
                default: '',
                example: 'emails@appconda.io',
            })
            .addRule('subject', {
                type: Template.TYPE_STRING,
                description: 'Email subject',
                default: '',
                example: 'Please verify your email address',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'EmailTemplate';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_EMAIL_TEMPLATE;
    }
}
