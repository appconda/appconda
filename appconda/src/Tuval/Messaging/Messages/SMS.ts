
import { Message } from '../Message';

export class SMS implements Message {
    private to: string[];
    private content: string;
    private from: string | null;
    private attachments: string[] | null;

    /**
     * @param to Array of recipient phone numbers
     * @param content The message content
     * @param from Optional sender phone number
     * @param attachments Optional array of attachment URLs
     */
    constructor(
        to: string[],
        content: string,
        from: string | null = null,
        attachments: string[] | null = null
    ) {
        this.to = to;
        this.content = content;
        this.from = from;
        this.attachments = attachments;
    }

    /**
     * Get the list of recipients.
     */
    getTo(): string[] {
        return this.to;
    }

    /**
     * Get the message content.
     */
    getContent(): string {
        return this.content;
    }

    /**
     * Get the sender's phone number.
     */
    getFrom(): string | null {
        return this.from;
    }

    /**
     * Get the list of attachments.
     */
    getAttachments(): string[] | null {
        return this.attachments;
    }
}
