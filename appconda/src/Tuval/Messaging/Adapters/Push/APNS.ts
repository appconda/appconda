import { Push as PushAdapter } from '../Push';
    import { JWT } from '../../Hekpers/JWT';
    import { Push as PushMessage } from '../../Messages/Push';
    import { Response } from '../../Response';

    export class APNS extends PushAdapter {
        protected static NAME = 'APNS';

        private authKey: string;
        private authKeyId: string;
        private teamId: string;
        private bundleId: string;
        private sandbox: boolean;

        /**
         * @param authKey Your APNS authentication key.
         * @param authKeyId Your APNS authentication key ID.
         * @param teamId Your Apple developer team ID.
         * @param bundleId Your app's bundle ID.
         * @param sandbox Whether to use the sandbox environment.
         */
        constructor(
            authKey: string,
            authKeyId: string,
            teamId: string,
            bundleId: string,
            sandbox: boolean = false
        ) {
            super();
            this.authKey = authKey;
            this.authKeyId = authKeyId;
            this.teamId = teamId;
            this.bundleId = bundleId;
            this.sandbox = sandbox;
        }

        getName(): string {
            return APNS.NAME;
        }

        getMaxMessagesPerRequest(): number {
            return 5000;
        }

        /**
         * Process the push message.
         */
        public async process(message: PushMessage): Promise<any> {
            const payload = {
                aps: {
                    alert: {
                        title: message.getTitle(),
                        body: message.getBody(),
                    },
                    badge: message.getBadge(),
                    sound: message.getSound(),
                    data: message.getData(),
                },
            };

            const claims = {
                iss: this.teamId,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600,
            };

            const jwt = JWT.encode(
                claims,
                this.authKey,
                'ES256',
                this.authKeyId
            );

            const endpoint = this.sandbox ? 'https://api.development.push.apple.com' : 'https://api.push.apple.com';

            const urls = message.getTo().map(token => `${endpoint}/3/device/${token}`);

            const results = await this.requestMulti(
                'POST',
                urls,
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`,
                    'apns-topic': this.bundleId,
                    'apns-push-type': 'alert',
                },
                [payload]
            );

            const response = new Response(this.getType());

            for (const result of results) {
                const device = result.url.split('/').pop();
                const statusCode = result.statusCode;

                switch (statusCode) {
                    case 200:
                        response.incrementDeliveredTo();
                        response.addResult(device);
                        break;
                    default:
                        const error = result.response?.reason === 'ExpiredToken' || result.response?.reason === 'BadDeviceToken'
                            ? this.getExpiredErrorMessage()
                            : result.response?.reason;

                        response.addResult(device, error);
                        break;
                }
            }

            return response.toArray();
        }
    }