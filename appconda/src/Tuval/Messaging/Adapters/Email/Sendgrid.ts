import { Email as EmailAdapter } from '../Email';
import { Email as EmailMessage } from '../../Messages/Email';
import { Response } from '../../Response';

export class Sendgrid extends EmailAdapter {
    protected static NAME = 'Sendgrid';

    private apiKey: string;

    /**
     * @param apiKey Your Sendgrid API key to authenticate with the API.
     */
    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    getName(): string {
        return Sendgrid.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * Process the email message.
     */
    protected async process(message: EmailMessage): Promise<any> {
        const personalizations = [
            {
                to: message.getTo().map(to => ({ email: to })),
                subject: message.getSubject(),
            },
        ];

        if (message.getCC() !== null) {
            personalizations[0]['cc'] = message.getCC().map(cc => ({
                name: cc.name || undefined,
                email: cc.email,
            }));
        }

        if (message.getBCC() !== null) {
            personalizations[0]['bcc'] = message.getBCC().map(bcc => ({
                name: bcc.name || undefined,
                email: bcc.email,
            }));
        }

        const attachments = [];

        if (message.getAttachments() !== null) {
            let size = 0;

            for (const attachment of message.getAttachments()) {
                size += require('fs').statSync(attachment.getPath()).size;
            }

            if (size > Sendgrid.MAX_ATTACHMENT_BYTES) {
                throw new Error('Attachments size exceeds the maximum allowed size of 25MB');
            }

            for (const attachment of message.getAttachments()) {
                attachments.push({
                    content: require('fs').readFileSync(attachment.getPath(), 'base64'),
                    filename: attachment.getName(),
                    type: attachment.getType(),
                    disposition: 'attachment',
                });
            }
        }

        const body = {
            personalizations: personalizations,
            reply_to: {
                name: message.getReplyToName(),
                email: message.getReplyToEmail(),
            },
            from: {
                name: message.getFromName(),
                email: message.getFromEmail(),
            },
            content: [
                {
                    type: message.isHtml() ? 'text/html' : 'text/plain',
                    value: message.getContent(),
                },
            ],
        };

        if (attachments.length > 0) {
            body['attachments'] = attachments;
        }

        const response = new Response(this.getType());
        const result = await this.request(
            'POST',
            'https://api.sendgrid.com/v3/mail/send',
            {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body
        );

        const statusCode = result.statusCode;

        if (statusCode === 202) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => response.addResult(to));
        } else {
            message.getTo().forEach(to => {
                if (typeof result.response === 'string') {
                    response.addResult(to, result.response);
                } else if (result.response?.errors?.[0]?.message) {
                    response.addResult(to, result.response.errors[0].message);
                } else {
                    response.addResult(to, 'Unknown error');
                }
            });
        }

        return response.toArray();
    }
}