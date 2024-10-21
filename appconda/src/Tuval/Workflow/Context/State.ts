/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProcessItem } from '../ProcessItem';
import { Status } from './Status';

export interface StateInterface<V = any> {
    ref: string;
    name?: string;
    status: Status;
    value?: V;
}

export class State<V = any> {
    public value?: V;

    public ref!: string;
    public name?: string;
    public status = Status.Ready;

    constructor(data?: Partial<StateInterface>) {
        if (data) Object.assign(this, data);
    }


    clone({ value } = { value: false }) {
        return State.deserialize(this.serialize({ value }));
    }


    serialize({ value } = { value: true }) {
        return {
            ref: this.ref,
            status: this.status,
            ...(value ? { value: this.value } : {}),
            ...(this.name ? { name: this.name } : {}),
        };
    }

    static deserialize<V = any>(state: StateInterface<V>) {
        return new State<V>({ ...state });
    }


    static build<V = any>(ref: string, options: { step?: ProcessItem, name?: string; value?: V; status?: Status }) {
        return new State<V>({ ref, ...options });
    }
}