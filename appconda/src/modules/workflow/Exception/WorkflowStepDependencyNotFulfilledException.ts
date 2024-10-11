// Import the base exception class
export class WorkflowStepDependencyNotFulfilledException extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'WorkflowStepDependencyNotFulfilledException'; // Set the error name
        // Ensure the prototype chain is correctly set
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
