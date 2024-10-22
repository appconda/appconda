import { nanoid } from "../../Platform/Services/id-service/nanoid/nanoid";
import { Hook, Validator } from "../Core";
import { Job } from "../Queue";
import { SequenceFlow } from "./Flows/SequenceFlow";
import { Context } from "./Context/Context";
import { State } from "./Context/State";
import { Status } from "./Context/Status";
import { Token } from "./Context/Token";
import { Process } from "./Process";
import { StepExecuter } from "./StepExecuter";

export interface GoOutInterface {
    activity: ProcessItem;
    pause?: boolean | string;
}

export enum Execution {
    Contionue = 'CONTINUE',
    NOOP = 'NOOP',
    End = 'END'
}

export abstract class ProcessItem {
    public static readonly HTTP_REQUEST_METHOD_GET = 'GET';
    public static readonly HTTP_REQUEST_METHOD_POST = 'POST';
    public static readonly HTTP_REQUEST_METHOD_PUT = 'PUT';
    public static readonly HTTP_REQUEST_METHOD_PATCH = 'PATCH';
    public static readonly HTTP_REQUEST_METHOD_DELETE = 'DELETE';
    public static readonly HTTP_REQUEST_METHOD_OPTIONS = 'OPTIONS';
    public static readonly HTTP_REQUEST_METHOD_HEAD = 'HEAD';

    public static readonly TYPE_DEFAULT = 'Default';
    public static readonly TYPE_INIT = 'Init';
    public static readonly TYPE_SHUTDOWN = 'Shutdown';
    public static readonly TYPE_ERROR = 'Error';
    public static readonly TYPE_OPTIONS = 'Options';
    public static readonly TYPE_WORKER_START = 'WorkerStart';

    protected _name: string | null = null;
    protected _desc: string | null = null;
    protected _groups: string[] = [];
    protected _callback: any;
    protected options: { [key: string]: any } = {};
    protected params: { [key: string]: any } = {};
    protected injections: string[] = [];
    protected labels: { [key: string]: any } = {};
    protected type: string = ProcessItem.TYPE_DEFAULT;

    protected id: string = nanoid();
    protected payload: any = {};


    public token?: Token;
    public context?: Context;

    public stepExecuter: StepExecuter;
    public _initHook: Hook;
    public _errorHook: Hook = new Hook();
    public _shutdownHook: Hook = new Hook();
    private _actionHook: Job;

    public setStepExecuter(stepExecuter: StepExecuter) {
        this.stepExecuter = stepExecuter;

        if (this._initHook) {
            this.stepExecuter.init(this._initHook);
        }
        if (this._actionHook) {
            this.stepExecuter.job(this._actionHook);
        }

        if (this._shutdownHook) {
            this.stepExecuter.shutdown(this._shutdownHook);
        }

        if (this._errorHook) {
            this.stepExecuter.error(this._errorHook);
        }
    }


    public init() {
        const hook = new Hook();
        this._initHook = hook;
        return hook;
    }

    public action() {
        const hook = new Job();
        this._actionHook = hook;
        return hook;


    }

    public shutdown() {
        const hook = new Hook();
        this._shutdownHook = hook;
        return hook;
    }

    public error() {
        const hook = new Hook();
        this._errorHook = hook;
        return hook;
    }


    //==============HTTP Scope============
    protected httpMethod: string | null = null;
    protected httpPath: string | null = null;
    protected httpAliasPath: string | null = null;
    protected httpAliasParams: { [key: string]: any } = {};

    protected incomings: ProcessItem[] = [];
    protected outgoings: SequenceFlow[] = [];
    path: Process;

    public execution: Execution = Execution.Contionue;

    /**
     * Set Http path
     *
     * @param path string
     * @returns this
     */
    public setHttpPath(path: string): this {
        this.httpPath = path;
        return this;
    }

    /**
     * Set Http Method
     *
     * @param method string
     * @returns this
     */
    public setHttpMethod(method: string): this {
        this.httpMethod = method;
        return this;
    }

    /**
     * Get httpPath
     *
     * @returns string | null
     */
    public getHttpPath(): string | null {
        return this.httpPath;
    }

    /**
     * Get the value of httpAliasPath
     *
     * @returns string | null
     */
    public getHttpAliasPath(): string | null {
        return this.httpAliasPath;
    }

    /**
     * Get the value of httpAliasParams
     *
     * @returns { [key: string]: any }
     */
    public getHttpAliasParams(): { [key: string]: any } {
        return this.httpAliasParams;
    }

    /**
     * Get the value of httpMethod
     *
     * @returns string | null
     */
    public getHttpMethod(): string | null {
        return this.httpMethod;
    }

    /**
     * Set httpAlias path and params
     *
     * @param path string
     * @param params { [key: string]: any }
     * @returns this
     */
    public httpAlias(path: string, params: { [key: string]: any } = {}): this {
        this.httpAliasPath = path;
        this.httpAliasParams = params;
        return this;
    }

    //====================================


    public setPath(path: Process): this {
        this.path = path;
        return this;
    }

    /**
     * Get Type
     *
     * @returns string
     */
    public getPath(): Process {
        return this.path;
    }


    /**
     * Set Type
     *
     * @param type string
     * @returns this
     */
    public setId(id: string): this {
        this.id = id;
        return this;
    }

    /**
     * Get Type
     *
     * @returns string
     */
    public getPayload(): any {
        return this.payload;
    }

    /**
     * Set Type
     *
     * @param type string
     * @returns this
     */
    public setPayload(payload: any): this {
        this.payload = payload;
        return this;
    }

    /**
     * Get Type
     *
     * @returns string
     */
    public getId(): string {
        return this.id;
    }

    //====================================
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
     * @returns string
     */
    public getType(): string {
        return this.type;
    }

    /**
     * Get the value of description
     *
     * @returns string | null
     */
    public getDesc(): string | null {
        return this._desc;
    }

    /**
     * Set the value of description
     *
     * @param description string
     * @returns this
     */
    public desc(description: string): this {
        this._desc = description;
        return this;
    }


    public getName(): string | null {
        return this._name;
    }
    /**
    * Set the value of description
    *
    * @param description string
    * @returns this
    */
    public setName(name: string): this {
        this._name = name;
        return this;
    }

    /**
     * Get the value of groups
     *
     * @returns string[]
     */
    public getGroups(): string[] {
        return this._groups;
    }

    /**
     * Set Groups
     *
     * @param groups string[]
     * @returns this
     */
    public groups(groups: string[]): this {
        this._groups = groups;
        return this;
    }

    /**
     * Get the value of callback
     *
     * @returns any
     */
    public getCallback(): any {
        /* if (typeof this['action'] === 'function') {
           return this['action'];
       } else {  */
        return this._callback;
        //}

    }

    /**
     * Set Callback
     *
     * @param callback any
     * @returns this
     */
    public callback(callback: Function): this {
        this._callback = callback;
        return this;
    }

    /**
     * Get the value of params
     *
     * @returns { [key: string]: any }
     */
    public getParams(): { [key: string]: any } {
        return this.params;
    }

    /**
     * Set Param
     *
     * @param key string
     * @param defaultValue any
     * @param validator Validator | ((value: any) => boolean)
     * @param description string
     * @param optional boolean
     * @param injections string[]
     * @returns this
     */
    public param(key: string, defaultValue: any, validator: Validator | ((value: any) => boolean), description: string = '', optional: boolean = false, injections: string[] = []): this {
        const param = {
            default: defaultValue,
            validator: validator,
            description: description,
            optional: optional,
            injections: injections,
        };
        this.options['param:' + key] = { ...param, type: 'param' };
        this.params[key] = param;

        return this;
    }

    public outgoing(step: SequenceFlow) {
        this.outgoings.push(step);
    }

    public getOutgoings(): SequenceFlow[] {
        return this.outgoings;
    }

    public incoming(step: ProcessItem) {
        this.incomings.push(step);
    }

    public getOIncomings(): ProcessItem[] {
        return this.incomings;
    }

    

    /**
     * Inject
     *
     * @param injection string
     * @returns this
     *
     * @throws Error
     */
    public inject(injection: string): this {
        if (this.injections.includes(injection)) {
            throw new Error('Injection already declared for ' + injection);
        }

        this.options['injection:' + injection] = {
            name: injection,
            type: 'injection',
        };
        this.injections.push(injection);

        return this;
    }

    /**
     * Get the value of labels
     *
     * @returns { [key: string]: any }
     */
    public getLabels(): { [key: string]: any } {
        return this.labels;
    }

    /**
     * Add Label
     *
     * @param key string
     * @param value any
     * @returns this
     */
    public label(key: string, value: any): this {
        this.labels[key] = value;

        return this;
    }

    /**
     * Get Http Options
     *
     * @returns { [key: string]: any }
     */
    public getOptions(): { [key: string]: any } {
        return this.options;
    }

    /* public next() {
        if (this.outgoings.length > 0) {
            return Execution.$continue(this.outgoings[0].getId());
        }
    } */

    public takeOutgoing(id?: string, options?: { pause: boolean | string }) {
        if (!this.outgoing || !this.outgoing?.length) return;

        const outgoing: ProcessItem[] = this.takeOutgoingSteps(this.getOutgoings(), id);

        if (!outgoing) return;

        this.goOut(outgoing.map((out) => ({ activity: out, pause: options?.pause })));
    }



    protected takeOutgoingSteps(outgoing: SequenceFlow[], id?: string): ProcessItem[] {
        if (id) {
            return outgoing?.filter((o) => o.getTargetRef() === id).map((o) => this.path.getStepById(o.getTargetRef()));

        } else return outgoing?.map((o) => this.path.getStepById(o.getTargetRef()!));
    };

    protected goOut(outgoing: GoOutInterface[]) {
        const pause = (out: GoOutInterface) =>
            typeof out!.pause === 'string'
                ? out!.pause === out!.activity.getId() || out!.pause === out!.activity.getId()
                : out!.pause;

        if (outgoing?.length && this.token) {
            if (this.execution === Execution.End) {
                this.token.status = Status.Completed;

                this.token.push(
                    State.build(this.getId(), {
                        name: this.getName(),
                        status: Status.Completed,
                        step: this!
                    }),
                );

            } else if (outgoing.length === 1) {
                if (this.execution === Execution.NOOP) {
                    this.token.status = Status.Waiting;

                } else {
                    this.token.status = Status.Completed;

                    const out = outgoing.pop();

                    this.token.push(
                        State.build(out!.activity!.getId(), {
                            name: out!.activity!.getName(),
                            status: pause(out!) ? Status.Paused : Status.Ready,
                            step: out!.activity!
                        }),
                    );
                }
            } else if (outgoing.length > 1 && this.context) {
                if (this.execution === Execution.NOOP) {
                    this.token.status = Status.Waiting;
                } else {
                    this.token.locked = true;
                    this.token.status = Status.Terminated;

                    for (const out of outgoing) {
                        const token = Token.build({
                            parent: this.token.id,
                        });

                        token.push(
                            State.build(out.activity.id, {
                                name: out.activity.getName(),
                                status: pause(out) ? Status.Paused : Status.Ready,
                                step: out!.activity
                            }),
                        );

                        this.context.addToken(token);
                    }
                }
            }
        }
    }

    public static buildId(bpmnItem: any) {
        const attributes = bpmnItem.$;
        return attributes.id;
    }

    public static buildName(bpmnItem: any) {
        const attributes = bpmnItem.$;
        return attributes.name;
    }

    public static buildMetadata<T>(bpmnItem: any): T {

        const extensionElements = bpmnItem['bpmn:extensionElements'];
        if (Array.isArray(extensionElements)) {
            const metadata = extensionElements[0].metadata;
            if (Array.isArray(metadata)) {
                return metadata[0].$;
            }

        }

        return null;
    }

    public validateMetadata(): void {
        
    }



}