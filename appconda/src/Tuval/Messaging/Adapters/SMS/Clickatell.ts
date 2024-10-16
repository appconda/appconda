import { SMS as SMSAdapter } from '../SMS';
    import { SMS as SMSMessage } from '../../Messages/SMS';
    import { Response } from '../../Response';

    export class Clickatell extends SMSAdapter {
        protected static NAME = 'Clickatell';

        private apiKey: string;
        private from: string | null;

        /**
         * @param apiKey Clickatell API Key
         * @param from Optional sender ID
         */
        constructor(apiKey: string, from: string | null = null) {
            super();
            this.apiKey = apiKey;
            this.from = from;
        }

        getName(): string {
            return Clickatell.NAME;
        }

        getMaxMessagesPerRequest(): number {
            return 500;
        }

        /**
         * Process the SMS message.
         */
        protected async process(message: SMSMessage): Promise<any> {
            const response = new Response(this.getType());

            const result = await this.request(
                'POST',
                'https://platform.clickatell.com/messages',
                {
                    'Content-Type': 'application/json',
                    'Authorization': this.apiKey,
                },
                {
                    content: message.getContent(),
                    from: this.from ?? message.getFrom(),
                    to: message.getTo(),
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