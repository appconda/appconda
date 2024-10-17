export class Version {
    public version: string;
    public base: string;
    public image: string;
    public supports: string[];

    /**
     * Version class that holds metadata about a Runtime Version.
     */
    constructor(version: string, base: string, image: string, supports: string[]) {
        this.version = version;
        this.base = base;
        this.image = image;
        this.supports = supports;
    }

    /**
     * Get parsed Version.
     */
    get(): { [key: string]: any } {
        return {
            version: this.version,
            base: this.base,
            image: this.image,
            supports: this.supports
        };
    }
}