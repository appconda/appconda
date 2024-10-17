import { SMS as SMSAdapter } from '../SMS';
import { SMS } from '../../Messages/SMS';
import { Response } from '../../Response';

export class Vonage extends SMSAdapter {
    protected static NAME = 'Vonage';

    private apiKey: string;
    private apiSecret: string;
    private from: string | null;

    /**
     * @param apiKey Vonage API Key
     * @param apiSecret Vonage API Secret
     * @param from Optional sender ID
     */
    constructor(apiKey: string, apiSecret: string, from: string | null = null) {
        super();
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.from = from;
    }

    getName(): string {
        return Vonage.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMS): Promise<any> {
        const to = message.getTo().map(to => to.replace(/^\+/, ''));

        const response = new Response(this.getType());
        const result = await this.request(
            'POST',
            'https://rest.nexmo.com/sms/json',
            {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            {
                text: message.getContent(),
                from: this.from ?? message.getFrom(),
                to: to[0],
                api_key: this.apiKey,
                api_secret: this.apiSecret,
            }
        );

        if ((result.response?.messages?.[0]?.status ?? null) === 0) {
            response.setDeliveredTo(1);
            response.addResult(result.response.messages[0].to);
        } else {
            const errorText = result.response?.messages?.[0]?.['error-text'] || 'Unknown error';
            response.addResult(message.getTo()[0], errorText);
        }

        return response.toArray();
    }
}