import { Adapter } from '../../Adapter';
import { Discord as DiscordMessage } from '../../Messages/Discord';
import { Response } from '../../Response';

export class Discord extends Adapter {
    protected static NAME = 'Discord';
    protected static TYPE = 'chat';
    protected static MESSAGE_TYPE = DiscordMessage;

    private webhookId: string;
    private webhookToken: string;

    /**
     * @param webhookId Your Discord webhook ID.
     * @param webhookToken Your Discord webhook token.
     */
    constructor(webhookId: string, webhookToken: string) {
        super();
        this.webhookId = webhookId;
        this.webhookToken = webhookToken;
    }

    getName(): string {
        return Discord.NAME;
    }

    getType(): string {
        return Discord.TYPE;
    }

    getMessageType(): string {
        return Discord.MESSAGE_TYPE.name;
    }

    getMaxMessagesPerRequest(): number {
        return 1;
    }

    /**
     * Process the Discord message.
     */
    protected async process(message: DiscordMessage): Promise<any> {
        const query: Record<string, any> = {};

        if (message.getWait() !== null) {
            query['wait'] = message.getWait();
        }
        if (message.getThreadId() !== null) {
            query['thread_id'] = message.getThreadId();
        }

        const queryString = new URLSearchParams(query).toString();

        const response = new Response(this.getType());
        const result = await this.request(
            'POST',
            `https://discord.com/api/webhooks/${this.webhookId}/${this.webhookToken}${queryString ? '?' + queryString : ''}`,
            {
                'Content-Type': 'application/json',
            },
            {
                content: message.getContent(),
                username: message.getUsername(),
                avatar_url: message.getAvatarUrl(),
                tts: message.getTts(),
                embeds: message.getEmbeds(),
                allowed_mentions: message.getAllowedMentions(),
                components: message.getComponents(),
                attachments: message.getAttachments(),
                flags: message.getFlags(),
                thread_name: message.getThreadName(),
            }
        );

        const statusCode = result.statusCode;

        if (statusCode >= 200 && statusCode < 300) {
            response.setDeliveredTo(1);
            response.addResult(this.webhookId);
        } else if (statusCode >= 400 && statusCode < 500) {
            response.addResult(this.webhookId, 'Bad Request.');
        } else {
            response.addResult(this.webhookId, 'Unknown Error.');
        }

        return response.toArray();
    }
}