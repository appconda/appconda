import { Token, TokenInterface } from './Token';
import { Status } from './Status';

export type IdentityOptions = { id: string } | { name: string };

export interface ContextInterface<D = any> {
    data?: D;
    status: Status;
    tokens: TokenInterface[];
}

export class Context<D = any> implements ContextInterface<D> {
    public data?: D;
    public tokens: Token[] = [];
    public status: Status = Status.Ready;

    constructor(data?: Partial<ContextInterface>) {
        if (data) Object.assign(this, data);
    }


    pause() {
        this.status = Status.Paused;

        return this;
    }


    resume(force = false) {
        if (force) this.status = Status.Ready;
        else if (this.status !== Status.Terminated) {
            this.status = Status.Ready;
        }

        return this;
    }


    addToken(token: Token) {
        this.tokens.push(token);
    }


    getTokens(id: string) {
        const tokens = [];
        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            if (token.state.ref === id) {
                tokens.push(token);
            }
        }
        return tokens;
        //return this.tokens.filter((token) => token.state.ref === id);
        //if ('name' in identity) return this.tokens.filter((token) => token.state.name === identity.name);
    }


    delTokens(id: string) {
        const tokens = this.getTokens(id)?.map((t) => t.id);
        if (tokens?.length) this.tokens = this.tokens.filter((t) => !tokens.includes(t.id));
    }


    isReady() {
        return this.status === Status.Ready;
    }


    isFailed() {
        return this.status === Status.Failed;
    }


    isPaused() {
        return this.tokens.filter((t) => !t.locked).every((t) => t.status === Status.Paused);
    }


    isCompleted() {
        return this.tokens.filter((t) => !t.locked).every((t) => t.status === Status.Completed);
    }


    isTerminated() {
        return this.tokens.filter((t) => !t.locked).every((t) => t.status === Status.Terminated);
    }


    isPartiallyTerminated() {
        return this.tokens.filter((t) => !t.locked).some((t) => t.status === Status.Terminated);
    }


    terminate() {
        this.status = Status.Terminated;

        return this;
    }


    next() {
        const states = [];
        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            if (token.status === Status.Ready) {
                 states.push(token.state);
            }
        }
        return states; // Explicitly return undefined if no token is ready
    }


    serialize({ data, value } = { data: true, value: true }) {
        return {
            status: this.status,
            ...(data ? { data: this.data } : {}),
            tokens: this.tokens.map((t) => t.serialize({ value })),
        };
    }


    static deserialize<D = any>(ctx: ContextInterface<D>) {
        return new Context<D>({
            ...ctx,
            tokens: ctx.tokens.map((t) => Token.deserialize(t)),
        });
    }


    static build<D = any>(data?: Partial<ContextInterface<D>>) {
        return new Context<D>(data);
    }
}