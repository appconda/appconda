import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../Messages/SMS';
import { Response } from '../../Response';

export class Seven extends SMSAdapter {
    protected static NAME = 'Seven';

    private apiKey: string;
    private from: string | null;

    /**
     * @param apiKey Seven API token
     * @param from Optional sender ID
     */
    constructor(apiKey: string, from: string | null = null) {
        super();
        this.apiKey = apiKey;
        this.from = from;
    }

    getName(): string {
        return Seven.NAME;
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
            'https://gateway.sms77.io/api/sms',
            {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${this.apiKey}`,
            },
            {
                from: this.from ?? message.getFrom(),
                to: message.getTo().join(','),
                text: message.getContent(),
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