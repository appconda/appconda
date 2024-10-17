import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../Messages/SMS';
import { Response } from '../../Response';

export class Twilio extends SMSAdapter {
    protected static NAME = 'Twilio';

    private accountSid: string;
    private authToken: string;
    private from: string | null;
    private messagingServiceSid: string | null;

    /**
     * @param accountSid Twilio Account SID
     * @param authToken Twilio Auth Token
     * @param from Optional sender ID
     * @param messagingServiceSid Optional Messaging Service SID
     */
    constructor(accountSid: string, authToken: string, from: string | null = null, messagingServiceSid: string | null = null) {
        super();
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.from = from;
        this.messagingServiceSid = messagingServiceSid;
    }

    getName(): string {
        return Twilio.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMSMessage): Promise<any> {
        const response = new Response(this.getType());

        const result = await this.request(
            'POST',
            `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
            },
            {
                Body: message.getContent(),
                From: this.from ?? message.getFrom(),
                MessagingServiceSid: this.messagingServiceSid ?? undefined,
                To: message.getTo()[0],
            }
        );

        if (result.statusCode >= 200 && result.statusCode < 300) {
            response.setDeliveredTo(1);
            response.addResult(message.getTo()[0]);
        } else {
            const errorMessage = result.response?.message || 'Unknown error';
            response.addResult(message.getTo()[0], errorMessage);
        }

        return response.toArray();
    }
}