// Import necessary classes and types

import { WorkflowResult } from "../State/WorkflowResult";


export class WorkflowException extends Error {
    private workflowResult: WorkflowResult;

    constructor(workflowResult: WorkflowResult, message: string, previous?: Error) {
        super(message);
        this.name = 'WorkflowException'; // Set the error name
        this.workflowResult = workflowResult;

        if (previous) {
            // Append previous error stack if available
            this.stack = `${previous.stack}\nCaused by: ${this.stack}`;
        }

        // Ensure the prototype chain is correctly set
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public getWorkflowResult(): WorkflowResult {
        return this.workflowResult;
    }
}
