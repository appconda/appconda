import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../Messages/SMS';
import { Response } from '../../Response';

export class Msg91 extends SMSAdapter {
    protected static NAME = 'Msg91';

    private senderId: string;
    private authKey: string;
    private templateId: string;

    /**
     * @param senderId Msg91 Sender ID
     * @param authKey Msg91 Auth Key
     * @param templateId Msg91 Template ID
     */
    constructor(senderId: string, authKey: string, templateId: string) {
        super();
        this.senderId = senderId;
        this.authKey = authKey;
        this.templateId = templateId;
    }

    getName(): string {
        return Msg91.NAME;
    }

    getMaxMessagesPerRequest(): number {
        // TODO: Find real limit
        return 100;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMSMessage): Promise<any> {
        const recipients = message.getTo().map(recipient => ({
            mobiles: recipient.replace(/^\+/, ''),
            content: message.getContent(),
            otp: message.getContent(),
        }));

        const response = new Response(this.getType());
        const result = await this.request(
            'POST',
            'https://api.msg91.com/api/v5/flow/',
            {
                'Content-Type': 'application/json',
                'Authkey': this.authKey,
            },
            {
                sender: this.senderId,
                template_id: this.templateId,
                recipients: recipients,
            }
        );

        if (result.statusCode === 200) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => response.addResult(to));
        } else {
            message.getTo().forEach(to => response.addResult(to, 'Unknown error'));
        }

        return response.toArray();
    }
}