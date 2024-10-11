import { Response } from '../../Response';
import { Template } from './Template';

export class TemplateSMS extends Template {
    constructor() {
        super();
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'SmsTemplate';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_SMS_TEMPLATE;
    }
}
