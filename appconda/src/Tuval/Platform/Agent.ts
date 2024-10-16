import { Action } from "./Action";

export abstract class Agent {
    public static readonly TYPE_HTTP = 'http';
    public static readonly TYPE_GRAPHQL = 'graphQL';
    public static readonly TYPE_TASK = 'task';
    public static readonly TYPE_WORKER = 'worker';
    public static readonly TYPE_SERVICE = 'service';

    protected actions: Action[] = [];
    protected type: string = '';

    /**
     * Set Type
     *
     * @param type string
     * @returns this
     */
    public setType(type: string): this {
        this.type = type;
        return this;
    }

    /**
     * Get Type
     *
     * @returns string | null
     */
    public getType(): string | null {
        return this.type;
    }

    /**
     * Add Action
     *
     * @param key string
     * @param action Action
     * @returns this
     */
    public addAction(key: string, action: Action): this {
        this.actions[key] = action;
        return this;
    }

    /**
     * Remove Action
     *
     * @param key string
     * @returns this
     */
    public removeAction(key: string): this {
        delete this.actions[key];
        return this;
    }

    /**
     * Get Action
     *
     * @param key string
     * @returns Action | null
     */
    public getAction(key: string): Action | null {
        return this.actions[key] || null;
    }

    /**
     * Get Actions
     *
     * @returns { [key: string]: Action }
     */
    public getActions():  Action[]  {
        return this.actions;
    }

    public getName():  string  {
        return '';
    }
}