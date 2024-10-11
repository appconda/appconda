// Import necessary classes
export class WorkflowValidationException extends Error {
    private validationErrors: Error[];

    constructor(validationErrors: Error[]) {
        super('Validation failed');
        this.name = 'WorkflowValidationException'; // Set the error name
        this.validationErrors = validationErrors;

        // Ensure the prototype chain is correctly set
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public getValidationErrors(): Error[] {
        return this.validationErrors;
    }
}
