import { Push as PushAdapter } from '../Push';
    import { JWT } from '../../Hekpers/JWT';
    import { Push as PushMessage } from '../../Messages/Push';
    import { Response } from '../../Response';

    export class FCM extends PushAdapter {
        protected static NAME = 'FCM';
        protected static DEFAULT_EXPIRY_SECONDS = 3600; // 1 hour
        protected static DEFAULT_SKEW_SECONDS = 60; // 1 minute
        protected static GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';

        private serviceAccountJSON: string;

        /**
         * @param serviceAccountJSON Service account JSON file contents
         */
        constructor(serviceAccountJSON: string) {
            super();
            this.serviceAccountJSON = serviceAccountJSON;
        }

        getName(): string {
            return FCM.NAME;
        }

        getMaxMessagesPerRequest(): number {
            return 5000;
        }

        /**
         * Process the push message.
         */
        protected async process(message: PushMessage): Promise<any> {
            const credentials = JSON.parse(this.serviceAccountJSON);

            const now = Math.floor(Date.now() / 1000);

            const signingKey = credentials['private_key'];
            const signingAlgorithm = 'RS256';

            const payload = {
                iss: credentials['client_email'],
                exp: now + FCM.DEFAULT_EXPIRY_SECONDS,
                iat: now - FCM.DEFAULT_SKEW_SECONDS,
                scope: 'https://www.googleapis.com/auth/firebase.messaging',
                aud: FCM.GOOGLE_TOKEN_URL,
            };

            const jwt = JWT.encode(
                payload,
                signingKey,
                signingAlgorithm
            );

            const tokenResponse = await this.request(
                'POST',
                FCM.GOOGLE_TOKEN_URL,
                {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                {
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt,
                }
            );

            const accessToken = tokenResponse.response.access_token;

            const shared: any = {
                message: {
                    notification: {
                        title: message.getTitle(),
                        body: message.getBody(),
                    },
                },
            };

            if (message.getData() !== null) {
                shared.message.data = message.getData();
            }
            if (message.getAction() !== null) {
                shared.message.android = { notification: { click_action: message.getAction() } };
                shared.message.apns = { payload: { aps: { category: message.getAction() } } };
            }
            if (message.getImage() !== null) {
                shared.message.android.notification.image = message.getImage();
                shared.message.apns.payload.aps['mutable-content'] = 1;
                shared.message.apns.fcm_options = { image: message.getImage() };
            }
            if (message.getSound() !== null) {
                shared.message.android.notification.sound = message.getSound();
                shared.message.apns.payload.aps.sound = message.getSound();
            }
            if (message.getIcon() !== null) {
                shared.message.android.notification.icon = message.getIcon();
            }
            if (message.getColor() !== null) {
                shared.message.android.notification.color = message.getColor();
            }
            if (message.getTag() !== null) {
                shared.message.android.notification.tag = message.getTag();
            }
            if (message.getBadge() !== null) {
                shared.message.apns.payload.aps.badge = message.getBadge();
            }

            const bodies = message.getTo().map(to => {
                const body = { ...shared };
                body.message.token = to;
                return body;
            });

            const results = await this.requestMulti(
                'POST',
                [`https://fcm.googleapis.com/v1/projects/${credentials['project_id']}/messages:send`],
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                bodies
            );

            const response = new Response(this.getType());

            results.forEach((result, index) => {
                if (result.statusCode === 200) {
                    response.incrementDeliveredTo();
                    response.addResult(message.getTo()[index]);
                } else {
                    const error = result.response?.error?.status === 'UNREGISTERED' || result.response?.error?.status === 'NOT_FOUND'
                        ? this.getExpiredErrorMessage()
                        : result.response?.error?.message || 'Unknown error';

                    response.addResult(message.getTo()[index], error);
                }
            });

            return response.toArray();
        }
    }