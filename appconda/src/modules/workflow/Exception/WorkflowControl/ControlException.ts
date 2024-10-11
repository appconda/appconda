// Base exception class
export abstract class ControlException extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = this.constructor.name; // Set the error name to the class name
    }
}
