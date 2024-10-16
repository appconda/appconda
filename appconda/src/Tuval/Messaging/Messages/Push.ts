
import { Message } from '../Message';

export class Push implements Message {
    private to: string[];
    private title: string;
    private body: string;
    private data: Record<string, any> | null;
    private action: string | null;
    private sound: string | null;
    private image: string | null;
    private icon: string | null;
    private color: string | null;
    private tag: string | null;
    private badge: number | null;

    /**
     * @param to The recipients of the push notification.
     * @param title The title of the push notification.
     * @param body The body of the push notification.
     * @param data Custom key-value pairs of the message's payload.
     * @param action The action associated with a user click on the notification.
     * @param sound The sound to play when the device receives the notification.
     * @param image The image to display when the device receives the notification.
     * @param icon Android only. The icon of the push notification.
     * @param color Android only. The icon color of the push notification.
     * @param tag Android only. Identifier used to replace existing notifications.
     * @param badge iOS only. The value of the badge on the home screen app icon.
     */
    constructor(
        to: string[],
        title: string,
        body: string,
        data: Record<string, any> | null = null,
        action: string | null = null,
        sound: string | null = null,
        image: string | null = null,
        icon: string | null = null,
        color: string | null = null,
        tag: string | null = null,
        badge: number | null = null
    ) {
        this.to = to;
        this.title = title;
        this.body = body;
        this.data = data;
        this.action = action;
        this.sound = sound;
        this.image = image;
        this.icon = icon;
        this.color = color;
        this.tag = tag;
        this.badge = badge;
    }

    /**
     * Get the list of recipients.
     */
    getTo(): string[] {
        return this.to;
    }

    /**
     * Get the sender's phone number (always null for Push).
     */
    getFrom(): string | null {
        return null;
    }

    /**
     * Get the title of the push notification.
     */
    getTitle(): string {
        return this.title;
    }

    /**
     * Get the body of the push notification.
     */
    getBody(): string {
        return this.body;
    }

    /**
     * Get the custom data payload.
     */
    getData(): Record<string, any> | null {
        return this.data;
    }

    /**
     * Get the action associated with the notification.
     */
    getAction(): string | null {
        return this.action;
    }

    /**
     * Get the sound to play with the notification.
     */
    getSound(): string | null {
        return this.sound;
    }

    /**
     * Get the image to display with the notification.
     */
    getImage(): string | null {
        return this.image;
    }

    /**
     * Get the icon for the notification (Android only).
     */
    getIcon(): string | null {
        return this.icon;
    }

    /**
     * Get the color of the notification icon (Android only).
     */
    getColor(): string | null {
        return this.color;
    }

    /**
     * Get the tag for the notification (Android only).
     */
    getTag(): string | null {
        return this.tag;
    }

    /**
     * Get the badge value for the app icon (iOS only).
     */
    getBadge(): number | null {
        return this.badge;
    }
}