import { Document } from '../../Tuval/Core';
import { Event } from './Event';
import { Client, Connection } from '../../Tuval/Queue';

export class Func extends Event {
    protected jwt: string = '';
    protected type: string = '';
    protected body: string = '';
    protected path: string = '';
    protected method: string = '';
    protected headers: Record<string, string> = {};
    protected function: Document | null = null;
    protected execution: Document | null = null;

    constructor(protected connection: Connection) {
        super(connection);
        this
            .setQueue(Event.FUNCTIONS_QUEUE_NAME)
            .setClass(Event.FUNCTIONS_CLASS_NAME);
    }

    public setFunction(func: Document): this {
        this.function = func;
        return this;
    }

    public getFunction(): Document | null {
        return this.function;
    }

    public setExecution(execution: Document): this {
        this.execution = execution;
        return this;
    }

    public getExecution(): Document | null {
        return this.execution;
    }

    public setType(type: string): this {
        this.type = type;
        return this;
    }

    public getType(): string {
        return this.type;
    }

    public setBody(body: string): this {
        this.body = body;
        return this;
    }

    public setMethod(method: string): this {
        this.method = method;
        return this;
    }

    public setPath(path: string): this {
        this.path = path;
        return this;
    }

    public setHeaders(headers: Record<string, string>): this {
        this.headers = headers;
        return this;
    }

    public getData(): string {
        //@ts-ignore
        return this.data ;
    }

    public setJWT(jwt: string): this {
        this.jwt = jwt;
        return this;
    }

    public getJWT(): string {
        return this.jwt;
    }

    public async trigger(): Promise<string | boolean> {
        if (this.paused) {
            return false;
        }

        const client = new Client(this.queue, this.connection);
        const events = this.getEvent() ? Event.generateEvents(this.getEvent(), this.getParams()) : null;

        return client.enqueue({
            project: this.project,
            user: this.user,
            function: this.function,
            execution: this.execution,
            type: this.type,
            jwt: this.jwt,
            payload: this.payload,
            events: events,
            body: this.body,
            path: this.path,
            headers: this.headers,
            method: this.method,
        });
    }

    public from(event: Event): this {
        this.project = event.getProject();
        this.user = event.getUser();
        this.payload = event.getPayload();
        this.event = event.getEvent();
        this.params = event.getParams();
        return this;
    }
}