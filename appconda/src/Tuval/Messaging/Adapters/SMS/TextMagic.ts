import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../Messages/SMS';
import { Response } from '../../Response';

export class TextMagic extends SMSAdapter {
    protected static NAME = 'Textmagic';

    private username: string;
    private apiKey: string;
    private from: string | null;

    /**
     * @param username Textmagic account username
     * @param apiKey Textmagic account API key
     * @param from Optional sender ID
     */
    constructor(username: string, apiKey: string, from: string | null = null) {
        super();
        this.username = username;
        this.apiKey = apiKey;
        this.from = from;
    }

    getName(): string {
        return TextMagic.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMSMessage): Promise<any> {
        const to = message.getTo().map(to => to.replace(/^\+/, ''));

        const response = new Response(this.getType());
        const result = await this.request(
            'POST',
            'https://rest.textmagic.com/api/v2/messages',
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-TM-Username': this.username,
                'X-TM-Key': this.apiKey,
            },
            {
                text: message.getContent(),
                from: (this.from ?? message.getFrom()).replace(/^\+/, ''),
                phones: to.join(','),
            }
        );

        if (result.statusCode >= 200 && result.statusCode < 300) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => response.addResult(to));
        } else {
            message.getTo().forEach(to => {
                const errorMessage = result.response?.message || 'Unknown error';
                response.addResult(to, errorMessage);
            });
        }

        return response.toArray();
    }
}