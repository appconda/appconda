import { SMS as SMSAdapter } from '../SMS';
    import { SMS as SMSMessage } from '../../Messages/SMS';
    import { Response } from '../../Response';

    export class Infobip extends SMSAdapter {
        protected static NAME = 'Infobip';

        private apiBaseUrl: string;
        private apiKey: string;
        private from: string | null;

        /**
         * @param apiBaseUrl Infobip API Base Url
         * @param apiKey Infobip API Key
         * @param from Optional sender ID
         */
        constructor(apiBaseUrl: string, apiKey: string, from: string | null = null) {
            super();
            this.apiBaseUrl = apiBaseUrl;
            this.apiKey = apiKey;
            this.from = from;
        }

        getName(): string {
            return Infobip.NAME;
        }

        getMaxMessagesPerRequest(): number {
            return 1000;
        }

        /**
         * Process the SMS message.
         */
        protected async process(message: SMSMessage): Promise<any> {
            const to = message.getTo().map(number => ({ to: number.replace(/^\+/, '') }));

            const response = new Response(this.getType());

            const result = await this.request(
                'POST',
                `https://${this.apiBaseUrl}/sms/2/text/advanced`,
                {
                    'Content-Type': 'application/json',
                    'Authorization': `App ${this.apiKey}`,
                },
                {
                    messages: {
                        text: message.getContent(),
                        from: this.from ?? message.getFrom(),
                        destinations: to,
                    },
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