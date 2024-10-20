
import { Email as EmailAdapter } from '../Email';
import { Email as EmailMessage } from '../../Messages/Email';
import { Response } from '../../Response';

export class Mock extends EmailAdapter {
    protected static NAME = 'Mock';

    getName(): string {
        return Mock.NAME;
    }

    getMaxMessagesPerRequest(): number {
        // TODO: Find real value for this
        return 1000;
    }

    /**
     * Process the email message.
     */
    protected async process(message: EmailMessage): Promise<any> {
        const response = new Response(this.getType());

        // Simulate sending email using a mock SMTP server
        const mail = {
            isSMTP: true,
            XMailer: 'Appconda Mailer',
            Host: 'maildev',
            Port: 1025,
            SMTPAuth: false,
            Username: '',
            Password: '',
            SMTPSecure: '',
            SMTPAutoTLS: false,
            CharSet: 'UTF-8',
            Subject: message.getSubject(),
            Body: message.getContent(),
            AltBody: message.getContent().replace(/<[^>]*>/g, ''),
            From: { email: message.getFromEmail(), name: message.getFromName() },
            ReplyTo: { email: message.getReplyToEmail(), name: message.getReplyToName() },
            isHTML: message.isHtml(),
            To: message.getTo(),
            send: function () {
                // Simulate sending logic
                return true; // or false to simulate failure
            },
            ErrorInfo: 'Simulated error'
        };

        if (!mail.send()) {
            message.getTo().forEach(to => {
                response.addResult(to, mail.ErrorInfo);
            });
        } else {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => {
                response.addResult(to);
            });
        }

        return response.toArray();
    }
}