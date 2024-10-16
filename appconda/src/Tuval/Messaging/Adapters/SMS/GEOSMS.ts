import { SMS as SMSAdapter } from '../SMS';
import { CallingCode } from './GEOSMS/CallingCode';
import { SMS } from '../../Messages/SMS';

export class GEOSMS extends SMSAdapter {
    protected static NAME = 'GEOSMS';

    protected defaultAdapter: SMSAdapter;
    protected localAdapters: { [key: string]: SMSAdapter } = {};

    constructor(defaultAdapter: SMSAdapter) {
        super();
        this.defaultAdapter = defaultAdapter;
    }

    getName(): string {
        return GEOSMS.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return Number.MAX_SAFE_INTEGER;
    }

    setLocal(callingCode: string, adapter: SMSAdapter): this {
        this.localAdapters[callingCode] = adapter;
        return this;
    }

    /**
     * Filter calling codes by adapter.
     */
    protected filterCallingCodesByAdapter(adapter: SMSAdapter): string[] {
        const result: string[] = [];

        for (const callingCode in this.localAdapters) {
            if (this.localAdapters[callingCode] === adapter) {
                result.push(callingCode);
            }
        }

        return result;
    }

    /**
     * Process the SMS message.
     */
    protected async process(message: SMS): Promise<any> {
        const results: { [key: string]: any } = {};
        let recipients = message.getTo();

        do {
            const [nextRecipients, nextAdapter] = this.getNextRecipientsAndAdapter(recipients);

            try {
                results[nextAdapter.getName()] = await nextAdapter.send(
                    new SMS(
                        nextRecipients,
                        message.getContent(),
                        message.getFrom(),
                        message.getAttachments()
                    )
                );
            } catch (e) {
                results[nextAdapter.getName()] = {
                    type: 'error',
                    message: e.message,
                };
            }

            recipients = recipients.filter(recipient => !nextRecipients.includes(recipient));
        } while (recipients.length > 0);

        return results;
    }

    /**
     * Get next recipients and adapter.
     */
    protected getNextRecipientsAndAdapter(recipients: string[]): [string[], SMSAdapter] {
        const nextRecipients: string[] = [];
        let nextAdapter: SMSAdapter | null = null;

        for (const recipient of recipients) {
            const adapter = this.getAdapterByPhoneNumber(recipient);

            if (nextAdapter === null || adapter === nextAdapter) {
                nextAdapter = adapter;
                nextRecipients.push(recipient);
            }
        }

        return [nextRecipients, nextAdapter];
    }

    /**
     * Get adapter by phone number.
     */
    protected getAdapterByPhoneNumber(phoneNumber: string | null): SMSAdapter {
        const callingCode = CallingCode.fromPhoneNumber(phoneNumber);
        if (!callingCode) {
            return this.defaultAdapter;
        }

        return this.localAdapters[callingCode] || this.defaultAdapter;
    }
}