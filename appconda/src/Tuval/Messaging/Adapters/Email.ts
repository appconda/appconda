import { Adapter } from '../Adapter';
import { Email as EmailMessage } from '../Messages/Email';

export abstract class Email extends Adapter {
    protected static TYPE = 'email';
    protected static MESSAGE_TYPE = EmailMessage;
    protected static MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25MB

    getType(): string {
        return Email.TYPE;
    }

    getMessageType(): string {
        return Email.MESSAGE_TYPE.name;
    }

    /**
     * Process an email message.
     */
    protected abstract process(message: EmailMessage): Promise<any>;
}