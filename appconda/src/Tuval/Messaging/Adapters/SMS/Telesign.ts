import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../Messages/SMS';
import { Response } from '../../Response';

export class Telesign extends SMSAdapter {
    protected static NAME = 'Telesign';

    private customerId: string;
    private apiKey: string;

    /**
     * @param customerId Telesign customer ID
     * @param apiKey Telesign API key
     */
    constructor(customerId: string, apiKey: string) {
        super();
        this.customerId = customerId;
        this.apiKey = apiKey;
    }

    getName(): string {
        return Telesign.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMSMessage): Promise<any> {
        const to = this.formatNumbers(message.getTo());

        const response = new Response(this.getType());

        const result = await this.request(
            'POST',
            'https://rest-ww.telesign.com/v1/verify/bulk_sms',
            {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${this.customerId}:${this.apiKey}`)}`,
            },
            {
                template: message.getContent(),
                recipients: to,
            }
        );

        if (result.statusCode === 200) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => response.addResult(to));
        } else {
            message.getTo().forEach(to => {
                const errorDescription = result.response?.errors?.[0]?.description || 'Unknown error';
                response.addResult(to, errorDescription);
            });
        }

        return response.toArray();
    }

    /**
     * Format numbers with unique IDs.
     */
    private formatNumbers(numbers: string[]): string {
        const formatted = numbers.map(number => `${number}:${this.generateUniqueId()}`);
        return formatted.join(',');
    }

    /**
     * Generate a unique ID.
     */
    private generateUniqueId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}