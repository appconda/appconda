import { Validator } from "../../Tuval/Core";


export class Hook {
    protected _desc: string = '';
    protected params: Record<string, any> = {};
    protected _groups: any[] = [];
    protected labels: Record<string, any> = {};
    protected _action: Function;
    protected injections: Record<string, any> = {};

    constructor() {
        this._action = () => { };
    }

    desc(desc: string): this {
        this._desc = desc;
        return this;
    }

    getDesc(): string {
        return this._desc;
    }

    groups(groups: any[]): this {
        this._groups = groups;
        return this;
    }

    getGroups(): any[] {
        return this._groups;
    }

    label(key: string, value: any): this {
        this.labels[key] = value;
        return this;
    }

    getLabel(key: string, defaultValue: any): any {
        return this.labels[key] !== undefined ? this.labels[key] : defaultValue;
    }

    action(action: (...args: any[]) => void): this {
        this._action = action;
        return this;
    }

    getAction(): Function {
        return this._action;
    }

    getInjections(): Record<string, any> {
        return this.injections;
    }

    inject(injection: string): this {
        if (this.injections[injection]) {
            throw new Error(`Injection already declared for ${injection}`);
        }

        this.injections[injection] = {
            name: injection,
            order: Object.keys(this.params).length + Object.keys(this.injections).length,
        };

        return this;
    }

    param(key: string, defaultValue: any, validator: Validator | Function, description: string = '', optional: boolean = false, injections: any[] = [], skipValidation: boolean = false): this {
        this.params[key] = {
            default: defaultValue,
            validator: validator,
            description: description,
            optional: optional,
            injections: injections,
            skipValidation: skipValidation,
            value: null,
            order: Object.keys(this.params).length + Object.keys(this.injections).length,
        };

        return this;
    }

    getParams(): Record<string, any> {
        return this.params;
    }

    getParamsValues(): Record<string, any> {
        const values: Record<string, any> = {};

        for (const key in this.params) {
            values[key] = this.params[key].value;
        }

        return values;
    }

    setParamValue(key: string, value: any): this {
        if (!this.params[key]) {
            throw new Error('Unknown key');
        }

        this.params[key].value = value;
        return this;
    }

    getParamValue(key: string): any {
        if (!this.params[key]) {
            throw new Error('Unknown key');
        }

        return this.params[key].value;
    }
}
