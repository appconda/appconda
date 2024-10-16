
export class Attachment {
    private name: string;
    private path: string;
    private type: string;

    /**
     * @param name The name of the file.
     * @param path The content of the file.
     * @param type The MIME type of the file.
     */
    constructor(name: string, path: string, type: string) {
        this.name = name;
        this.path = path;
        this.type = type;
    }

    /**
     * Get the name of the file.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Get the content of the file.
     */
    getPath(): string {
        return this.path;
    }

    /**
     * Get the MIME type of the file.
     */
    getType(): string {
        return this.type;
    }
}