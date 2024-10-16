import { SMS as SMSAdapter } from '../SMS';
    import { SMS as SMSMessage } from '../../Messages/SMS';
    import { Response } from '../../Response';

    export class Mock extends SMSAdapter {
        protected static NAME = 'Mock';

        private user: string;
        private secret: string;

        /**
         * @param user User ID
         * @param secret User secret
         */
        constructor(user: string, secret: string) {
            super();
            this.user = user;
            this.secret = secret;
        }

        getName(): string {
            return Mock.NAME;
        }

        getMaxMessagesPerRequest(): number {
            return 1000;
        }

        /**
         * Process the SMS message.
         */
        protected async process(message: SMSMessage): Promise<any> {
            const response = new Response(this.getType());

            response.setDeliveredTo(message.getTo().length);

            const result = await this.request(
                'POST',
                'http://request-catcher:5000/mock-sms',
                {
                    'Content-Type': 'application/json',
                    'X-Username': this.user,
                    'X-Key': this.secret,
                },
                {
                    message: message.getContent(),
                    from: message.getFrom(),
                    to: message.getTo().join(','),
                }
            );

            if (result.statusCode === 200) {
                response.setDeliveredTo(message.getTo().length);
                message.getTo().forEach(to => response.addResult(to));
            } else {
                message.getTo().forEach(to => response.addResult(to, 'Unknown Error.'));
            }

            return response.toArray();
        }
    }