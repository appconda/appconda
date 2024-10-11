import { Event } from './Event';

export class FunctionEvent extends Event {
    public isValid(value: any): boolean {
        if ((value ?? '').startsWith('functions.')) {
            this.message = 'Triggering a function on a function event is not allowed.';
            return false;
        }

        return super.isValid(value);
    }
}