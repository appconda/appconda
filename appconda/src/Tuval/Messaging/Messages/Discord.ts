
import { Message } from '../Message';

export class Discord implements Message {
    private content: string;
    private username: string | null;
    private avatarUrl: string | null;
    private tts: boolean | null;
    private embeds: Record<string, any> | null;
    private allowedMentions: Record<string, any> | null;
    private components: Record<string, any> | null;
    private attachments: Record<string, any> | null;
    private flags: string | null;
    private threadName: string | null;
    private wait: boolean | null;
    private threadId: string | null;

    /**
     * @param content The message content.
     * @param username The username to display.
     * @param avatarUrl The URL of the avatar to display.
     * @param tts Whether the message should be read aloud.
     * @param embeds Embedded rich content.
     * @param allowedMentions Controls who can be mentioned.
     * @param components Message components like buttons.
     * @param attachments Message attachments.
     * @param flags Message flags.
     * @param threadName The name of the thread.
     * @param wait Whether to wait for the message to be sent.
     * @param threadId The ID of the thread.
     */
    constructor(
        content: string,
        username: string | null = null,
        avatarUrl: string | null = null,
        tts: boolean | null = null,
        embeds: Record<string, any> | null = null,
        allowedMentions: Record<string, any> | null = null,
        components: Record<string, any> | null = null,
        attachments: Record<string, any> | null = null,
        flags: string | null = null,
        threadName: string | null = null,
        wait: boolean | null = null,
        threadId: string | null = null
    ) {
        this.content = content;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.tts = tts;
        this.embeds = embeds;
        this.allowedMentions = allowedMentions;
        this.components = components;
        this.attachments = attachments;
        this.flags = flags;
        this.threadName = threadName;
        this.wait = wait;
        this.threadId = threadId;
    }

    /**
     * Get the message content.
     */
    getContent(): string {
        return this.content;
    }

    /**
     * Get the username to display.
     */
    getUsername(): string | null {
        return this.username;
    }

    /**
     * Get the URL of the avatar to display.
     */
    getAvatarUrl(): string | null {
        return this.avatarUrl;
    }

    /**
     * Check if the message should be read aloud.
     */
    getTts(): boolean | null {
        return this.tts;
    }

    /**
     * Get the embedded rich content.
     */
    getEmbeds(): Record<string, any> | null {
        return this.embeds;
    }

    /**
     * Get the allowed mentions.
     */
    getAllowedMentions(): Record<string, any> | null {
        return this.allowedMentions;
    }

    /**
     * Get the message components.
     */
    getComponents(): Record<string, any> | null {
        return this.components;
    }

    /**
     * Get the message attachments.
     */
    getAttachments(): Record<string, any> | null {
        return this.attachments;
    }

    /**
     * Get the message flags.
     */
    getFlags(): string | null {
        return this.flags;
    }

    /**
     * Get the name of the thread.
     */
    getThreadName(): string | null {
        return this.threadName;
    }

    /**
     * Check if the message should wait to be sent.
     */
    getWait(): boolean | null {
        return this.wait;
    }

    /**
     * Get the ID of the thread.
     */
    getThreadId(): string | null {
        return this.threadId;
    }
}