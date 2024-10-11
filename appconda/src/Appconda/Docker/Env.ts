export class Env {
    protected vars: Record<string, string> = {};

    constructor(data: string) {
        const rows = data.split('\n');

        for (const row of rows) {
            const [key, value] = row.split('=', 2).map(part => part.trim());
            if (key) {
                this.vars[key] = value ?? '';
            }
        }
    }

    public setVar(key: string, value: string): this {
        this.vars[key] = value;
        return this;
    }

    public getVar(key: string): string {
        return this.vars[key] ?? '';
    }

    public list(): Record<string, string> {
        return this.vars;
    }

    public export(): string {
        return Object.entries(this.vars)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
    }
}