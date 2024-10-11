
import { WorkflowStep } from '../Step/WorkflowStep';
import { OutputFormat } from './ExecutionLog/OutputFormat/OutputFormat';
import { WorkflowContainer } from './WorkflowContainer';
import { WorkflowState } from './WorkflowState';

export class WorkflowResult {
    private _success: boolean;
    private exception: Error | null;
    private workflowState: WorkflowState;

    constructor(
        workflowState: WorkflowState,
        success: boolean,
        exception: Error | null = null
    ) {
        this._success = success;
        this.exception = exception;
        this.workflowState = workflowState;
    }

    /**
     * Get the name of the executed workflow
     */
    public getWorkflowName(): string {
        return this.workflowState.getWorkflowName();
    }

    /**
     * Check if the workflow has been executed successfully
     */
    public success(): boolean {
        return this._success;
    }

    /**
     * Get the full debug log for the workflow execution
     */
    public debug(formatter: OutputFormat | null = null): string {
        return this.workflowState.getExecutionLog().debug(formatter ?? new StringLog());
    }

    /**
     * Check if the workflow execution has triggered warnings
     */
    public hasWarnings(): boolean {
        return this.workflowState.getExecutionLog().getWarnings().length > 0;
    }

    /**
     * Get all warnings of the workflow execution.
     * Returns a nested array with all warnings grouped by stage (WorkflowState::STAGE_* constants).
     *
     * @returns string[][]
     */
    public getWarnings(): string[][] {
        return this.workflowState.getExecutionLog().getWarnings();
    }

    /**
     * Returns the exception which led to a failed workflow.
     * If the workflow was executed successfully, null will be returned.
     */
    public getException(): Error | null {
        return this.exception;
    }

    /**
     * Get the container of the process
     */
    public getContainer(): WorkflowContainer {
        return this.workflowState.getWorkflowContainer();
    }

    /**
     * Get the last executed step of the workflow
     */
    public getLastStep(): WorkflowStep {
        return this.workflowState.getCurrentStep();
    }
}
