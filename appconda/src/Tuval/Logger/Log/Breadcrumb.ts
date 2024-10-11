// src/Log/Breadcrumb.ts
import { Log } from '../Log';

export class Breadcrumb {
    private type: string;
    private category: string;
    private message: string;
    private timestamp: number;

    constructor(type: string, category: string, message: string, timestamp: number) {
        this.type = type;
        this.category = category;
        this.message = message;
        this.timestamp = timestamp;

        switch (this.getType()) {
            case Log.TYPE_DEBUG:
            case Log.TYPE_ERROR:
            case Log.TYPE_INFO:
            case Log.TYPE_WARNING:
            case Log.TYPE_VERBOSE:
                break;
            default:
                throw new Error('Type has to be one of Log.TYPE_DEBUG, Log.TYPE_ERROR, Log.TYPE_INFO, Log.TYPE_WARNING, Log.TYPE_VERBOSE.');
        }
    }

    getType(): string {
        return this.type;
    }

    getCategory(): string {
        return this.category;
    }

    getMessage(): string {
        return this.message;
    }

    getTimestamp(): number {
        return this.timestamp;
    }
}