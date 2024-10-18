import { nanoid } from "../../Platform/Services/id-service/nanoid/nanoid";
import { Validator } from "../Core";

export abstract class WorkflowStep {
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
    protected type: string = WorkflowStep.TYPE_DEFAULT;

    protected id: string = nanoid();


    //==============HTTP Scope============
    protected httpMethod: string | null = null;
    protected httpPath: string | null = null;
    protected httpAliasPath: string | null = null;
    protected httpAliasParams: { [key: string]: any } = {};

    protected incomings: WorkflowStep[] = [];
    protected outgoings: WorkflowStep[] = [];

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
    public name(name: string): this {
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
    public callback(callback: any): this {
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

    public outgoing(step: WorkflowStep) {
        this.outgoings.push(step);
    }

    /**
     * Get the value of injections
     *
     * @returns string[]
     */
    public getInjections(): string[] {
        return this.injections;
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
}