
import { Adapter } from '../Adapter';
import { SMS as SMSMessage } from '../Messages/SMS';

export abstract class SMS extends Adapter {
    protected static TYPE = 'sms';
    protected static MESSAGE_TYPE = SMSMessage;

    getType(): string {
        return SMS.TYPE;
    }

    getMessageType(): string {
        return SMS.MESSAGE_TYPE.name;
    }

    /**
     * Send an SMS message.
     * @param message Message to send.
     */
    protected abstract process(message: SMSMessage): Promise<any>;
}