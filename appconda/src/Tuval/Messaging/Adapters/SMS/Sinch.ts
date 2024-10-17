
import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../Messages/SMS';
import { Response } from '../../Response';

export class Sinch extends SMSAdapter {
    protected static NAME = 'Sinch';

    private servicePlanId: string;
    private apiToken: string;
    private from: string | null;

    /**
     * @param servicePlanId Sinch Service plan ID
     * @param apiToken Sinch API token
     * @param from Optional sender ID
     */
    constructor(servicePlanId: string, apiToken: string, from: string | null = null) {
        super();
        this.servicePlanId = servicePlanId;
        this.apiToken = apiToken;
        this.from = from;
    }

    getName(): string {
        return Sinch.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMSMessage): Promise<any> {
        const to = message.getTo().map(number => number.replace(/^\+/, ''));

        const response = new Response(this.getType());

        const result = await this.request(
            'POST',
            `https://sms.api.sinch.com/xms/v1/${this.servicePlanId}/batches`,
            {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiToken}`,
            },
            {
                from: this.from ?? message.getFrom(),
                to: to,
                body: message.getContent(),
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