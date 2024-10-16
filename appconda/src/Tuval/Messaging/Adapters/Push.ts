import { Adapter } from '../Adapter';
import { Push as PushMessage } from '../Messages/Push';

export abstract class Push extends Adapter {
    protected static TYPE = 'push';
    protected static MESSAGE_TYPE = PushMessage;
    protected static EXPIRED_MESSAGE = 'Expired device token';

    getType(): string {
        return Push.TYPE;
    }

    getMessageType(): string {
        return Push.MESSAGE_TYPE.name;
    }

    protected getExpiredErrorMessage(): string {
        return Push.EXPIRED_MESSAGE;
    }

    /**
     * Send a push message.
     */
    protected abstract process(message: PushMessage): Promise<any>;
}