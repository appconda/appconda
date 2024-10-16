import { Message } from '../Message';
import { Attachment } from './Email/Attachment';

export class Email implements Message {
    private to: string[];
    private subject: string;
    private content: string;
    private fromName: string;
    private fromEmail: string;
    private replyToName: string;
    private replyToEmail: string;
    private cc: { name: string, email: string }[] | null;
    private bcc: { name: string, email: string }[] | null;
    private attachments: Attachment[] | null;
    private html: boolean;

    /**
     * @param to The recipients of the email.
     * @param subject The subject of the email.
     * @param content The content of the email.
     * @param fromName The name of the sender.
     * @param fromEmail The email address of the sender.
     * @param replyToName The name of the reply to.
     * @param replyToEmail The email address of the reply to.
     * @param cc The CC recipients of the email.
     * @param bcc The BCC recipients of the email.
     * @param attachments The attachments of the email.
     * @param html Whether the message is HTML or not.
     */
    constructor(
        to: string[],
        subject: string,
        content: string,
        fromName: string,
        fromEmail: string,
        replyToName: string | null = null,
        replyToEmail: string | null = null,
        cc: { name: string, email: string }[] | null = null,
        bcc: { name: string, email: string }[] | null = null,
        attachments: Attachment[] | null = null,
        html: boolean = false
    ) {
        this.to = to;
        this.subject = subject;
        this.content = content;
        this.fromName = fromName;
        this.fromEmail = fromEmail;
        this.replyToName = replyToName ?? fromName;
        this.replyToEmail = replyToEmail ?? fromEmail;
        this.cc = cc;
        this.bcc = bcc;
        this.attachments = attachments;
        this.html = html;

        if (this.cc) {
            for (const recipient of this.cc) {
                if (!recipient.name || !recipient.email) {
                    throw new Error('Each recipient in cc must have a name and email');
                }
            }
        }

        if (this.bcc) {
            for (const recipient of this.bcc) {
                if (!recipient.name || !recipient.email) {
                    throw new Error('Each recipient in bcc must have a name and email');
                }
            }
        }
    }

    /**
     * Get the list of recipients.
     */
    getTo(): string[] {
        return this.to;
    }

    /**
     * Get the subject of the email.
     */
    getSubject(): string {
        return this.subject;
    }

    /**
     * Get the content of the email.
     */
    getContent(): string {
        return this.content;
    }

    /**
     * Get the sender's name.
     */
    getFromName(): string {
        return this.fromName;
    }

    /**
     * Get the sender's email address.
     */
    getFromEmail(): string {
        return this.fromEmail;
    }

    /**
     * Get the reply-to name.
     */
    getReplyToName(): string {
        return this.replyToName;
    }

    /**
     * Get the reply-to email address.
     */
    getReplyToEmail(): string {
        return this.replyToEmail;
    }

    /**
     * Get the CC recipients.
     */
    getCC(): { name: string, email: string }[] | null {
        return this.cc;
    }

    /**
     * Get the BCC recipients.
     */
    getBCC(): { name: string, email: string }[] | null {
        return this.bcc;
    }

    /**
     * Get the attachments.
     */
    getAttachments(): Attachment[] | null {
        return this.attachments;
    }

    /**
     * Check if the email content is HTML.
     */
    isHtml(): boolean {
        return this.html;
    }
}