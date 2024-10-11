export class WorkflowContainer {
    
    protected items: Record<string, any> = {};

    public get(key: string): any {
        return this.items[key] ?? null;
    }

    public set(key: string, value: any): WorkflowContainer {
        this.items[key] = value;
        return this;
    }

    public unset(key: string): WorkflowContainer {
        delete this.items[key];
        return this;
    }

    public has(key: string): boolean {
        return key in this.items;
    }
}
