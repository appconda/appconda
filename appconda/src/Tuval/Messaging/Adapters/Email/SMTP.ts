import { Email as EmailAdapter } from '../Email';
import { Email as EmailMessage } from '../../Messages/Email';
import { Response } from '../../Response';
import nodemailer from 'nodemailer';

export class SMTP extends EmailAdapter {
    protected static NAME = 'SMTP';

    private host: string;
    private port: number;
    private username: string;
    private password: string;
    private smtpSecure: string;
    private smtpAutoTLS: boolean;
    private xMailer: string;

    /**
     * @param host SMTP hosts.
     * @param port The default SMTP server port.
     * @param username Authentication username.
     * @param password Authentication password.
     * @param smtpSecure SMTP Secure prefix. Can be '', 'ssl' or 'tls'
     * @param smtpAutoTLS Enable/disable SMTP AutoTLS feature. Defaults to false.
     * @param xMailer The value to use for the X-Mailer header.
     */
    constructor(
        host: string,
        port: number = 25,
        username: string = '',
        password: string = '',
        smtpSecure: string = '',
        smtpAutoTLS: boolean = false,
        xMailer: string = ''
    ) {
        super();
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.smtpSecure = smtpSecure;
        this.smtpAutoTLS = smtpAutoTLS;
        this.xMailer = xMailer;

        if (!['', 'ssl', 'tls'].includes(this.smtpSecure)) {
            throw new Error('Invalid SMTP secure prefix. Must be "", "ssl" or "tls"');
        }
    }

    getName(): string {
        return SMTP.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    private stripTags(html: string): string {
        return html.replace(/<\/?[^>]+(>|$)/g, '');
    }

    /**
     * Process the email message.
     */
    protected async process(message: EmailMessage): Promise<any> {
        const response = new Response(this.getType());
        const transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: this.smtpSecure === 'ssl',
            auth: {
                user: this.username,
                pass: this.password
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            }
        });

        const mailOptions: nodemailer.SendMailOptions = {
            from: `${message.getFromName()} <${message.getFromEmail()}>`,
            to: message.getTo().join(','),
            subject: message.getSubject(),
            html: message.isHtml() ? message.getContent() : undefined,
            text: this.stripTags(message.getContent()), // Plain text version
            replyTo: `${message.getReplyToName()} <${message.getReplyToEmail()}>`,
            cc: message.getCC().map(cc => ({ name: cc.name, address: cc.email })),
            bcc: message.getBCC().map(bcc => ({ name: bcc.name, address: bcc.email })),
            attachments: message.getAttachments().map(attachment => ({
                filename: attachment.getName(),
                path: attachment.getPath(),
                contentType: attachment.getType()
            })),
            xMailer: this.xMailer
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => response.addResult(to, ''));
        } catch (error) {
            message.getTo().forEach(to => response.addResult(to, error.message));
        }

        return response.toArray();
    }
}