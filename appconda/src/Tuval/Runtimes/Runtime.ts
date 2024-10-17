import { Version } from "./Version";

export class Runtime {
    protected key: string;
    protected name: string;
    protected startCommand: string;
    protected versions: Version[] = [];

    /**
     * Runtime that can contain different Versions.
     */
    constructor(key: string, name: string, startCommand: string) {
        this.key = key;
        this.name = name;
        this.startCommand = startCommand;
    }

    /**
     * Get key.
     */
    getKey(): string {
        return this.key;
    }

    /**
     * Adds new version to runtime.
     */
    addVersion(version: string, base: string, image: string, supports: string[]): void {
        this.versions.push(new Version(version, base, image, supports));
    }

    /**
     * List runtime with all parsed Versions.
     */
    list(): { [key: string]: any }[] {
        const list: { [key: string]: any }[] = [];
        for (const version of this.versions) {
            const key = `${this.key}-${version.version}`;
            list[key] = {
                key: this.key,
                name: this.name,
                logo: `${this.key}.png`,
                startCommand: this.startCommand,
                ...version.get()
            };
        }

        return list;
    }
}