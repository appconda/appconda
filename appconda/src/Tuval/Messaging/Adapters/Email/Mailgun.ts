
import { Email as EmailAdapter } from '../Email';
import { Email as EmailMessage } from '../../Messages/Email';
import { Response } from '../../Response';

export class Mailgun extends EmailAdapter {
    protected static NAME = 'Mailgun';

    private apiKey: string;
    private domain: string;
    private isEU: boolean;

    /**
     * @param apiKey Your Mailgun API key to authenticate with the API.
     * @param domain Your Mailgun domain to send messages from.
     */
    constructor(apiKey: string, domain: string, isEU: boolean = false) {
        super();
        this.apiKey = apiKey;
        this.domain = domain;
        this.isEU = isEU;
    }

    getName(): string {
        return Mailgun.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * Process the email message.
     */
    protected async process(message: EmailMessage): Promise<any> {
        const usDomain = 'api.mailgun.net';
        const euDomain = 'api.eu.mailgun.net';

        const domain = this.isEU ? euDomain : usDomain;

        const body: Record<string, any> = {
            to: message.getTo().join(','),
            from: `${message.getFromName()}<${message.getFromEmail()}>`,
            subject: message.getSubject(),
            text: message.isHtml() ? null : message.getContent(),
            html: message.isHtml() ? message.getContent() : null,
            'h:Reply-To': `${message.getReplyToName()}<${message.getReplyToEmail()}>`,
        };

        if (message.getCC() !== null) {
            body['cc'] = message.getCC().map(cc => cc.name ? `${cc.name}<${cc.email}>` : `<${cc.email}>`).join(',');
        }

        if (message.getBCC() !== null) {
            body['bcc'] = message.getBCC().map(bcc => bcc.name ? `${bcc.name}<${bcc.email}>` : `<${bcc.email}>`).join(',');
        }

        let isMultipart = false;

        if (message.getAttachments() !== null) {
            let size = 0;

            for (const attachment of message.getAttachments()) {
                size += require('fs').statSync(attachment.getPath()).size;
            }

            if (size > Mailgun.MAX_ATTACHMENT_BYTES) {
                throw new Error('Attachments size exceeds the maximum allowed size');
            }

            message.getAttachments().forEach((attachment, index) => {
                isMultipart = true;
                body[`attachment[${index}]`] = {
                    value: require('fs').createReadStream(attachment.getPath()),
                    options: {
                        filename: attachment.getName(),
                        contentType: attachment.getType(),
                    }
                };
            });
        }

        const response = new Response(this.getType());

        const headers = {
            'Authorization': 'Basic ' + Buffer.from(`api:${this.apiKey}`).toString('base64'),
            'Content-Type': isMultipart ? 'multipart/form-data' : 'application/x-www-form-urlencoded',
        };

        const result = await this.request(
            'POST',
            `https://${domain}/v3/${this.domain}/messages`,
            headers,
            body
        );

        const statusCode = result.statusCode;

        if (statusCode >= 200 && statusCode < 300) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => response.addResult(to));
        } else if (statusCode >= 400 && statusCode < 500) {
            message.getTo().forEach(to => {
                if (typeof result.response === 'string') {
                    response.addResult(to, result.response);
                } else if (result.response && result.response.message) {
                    response.addResult(to, result.response.message);
                } else {
                    response.addResult(to, 'Unknown error');
                }
            });
        }

        return response.toArray();
    }
}