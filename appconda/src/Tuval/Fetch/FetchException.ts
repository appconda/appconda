// src/utopia/fetch/FetchException.ts

export class FetchException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FetchException';
    }

    public toString(): string {
        return `${this.name}: ${this.message}`;
    }
}