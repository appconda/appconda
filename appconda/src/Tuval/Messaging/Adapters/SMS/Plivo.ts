import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../Messages/SMS';
import { Response } from '../../Response';

export class Plivo extends SMSAdapter {
    protected static NAME = 'Plivo';

    private authId: string;
    private authToken: string;
    private from: string | null;

    /**
     * @param authId Plivo Auth ID
     * @param authToken Plivo Auth Token
     * @param from Optional sender ID
     */
    constructor(authId: string, authToken: string, from: string | null = null) {
        super();
        this.authId = authId;
        this.authToken = authToken;
        this.from = from;
    }

    getName(): string {
        return Plivo.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMSMessage): Promise<any> {
        const response = new Response(this.getType());

        const result = await this.request(
            'POST',
            `https://api.plivo.com/v1/Account/${this.authId}/Message/`,
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${this.authId}:${this.authToken}`)}`,
            },
            {
                text: message.getContent(),
                src: this.from ?? message.getFrom() ?? 'Plivo',
                dst: message.getTo().join('<'),
            }
        );

        if (result.statusCode >= 200 && result.statusCode < 300) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => response.addResult(to));
        } else {
            message.getTo().forEach(to => response.addResult(to, 'Unknown error.'));
        }

        return response.toArray();
    }
}