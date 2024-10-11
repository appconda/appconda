export type HookAction = (...params: any[]) => any;

export class Hooks {
    private static hooks: Record<string, HookAction> = {};

    public static add(name: string, action: HookAction): void {
        this.hooks[name] = action;
    }

    public trigger(name: string, params: any[] = []): any {
        if (Hooks.hooks[name]) {
            return Hooks.hooks[name](...params);
        }

        return null;
    }
}
