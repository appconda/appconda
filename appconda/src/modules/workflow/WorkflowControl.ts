import { BreakException } from "./Exception/WorkflowControl/BreakException";
import { ContinueException } from "./Exception/WorkflowControl/ContinueException";
import { FailStepException } from "./Exception/WorkflowControl/FailStepException";
import { FailWorkflowException } from "./Exception/WorkflowControl/FailWorkflowException";
import { SkipStepException } from "./Exception/WorkflowControl/SkipStepException";
import { SkipWorkflowException } from "./Exception/WorkflowControl/SkipWorkflowException";
import { WorkflowState } from "./State/WorkflowState";

export class WorkflowControl {
    private workflowState: WorkflowState;

    constructor(workflowState: WorkflowState) {
        this.workflowState = workflowState;
    }

    /**
     * Mark the current step as skipped.
     * Use this if you detect, that the step execution is not necessary
     * (e.g. disabled by config, no entity to process, ...)
     * 
     * @param reason
     */
    public skipStep(reason: string): void {
        throw new SkipStepException(reason);
    }

    /**
     * Mark the current step as failed.
     * A failed step before and during the processing of a workflow leads to a failed workflow.
     * 
     * @param reason
     */
    public failStep(reason: string): void {
        throw new FailStepException(reason);
    }

    /**
     * Mark the workflow as failed.
     * If the workflow is failed after the process stage has been executed it's handled like a failed step.
     * 
     * @param reason
     */
    public failWorkflow(reason: string): void {
        throw new FailWorkflowException(reason);
    }

    /**
     * Skip the further workflow execution (e.g. if you detect it's not necessary to process the workflow).
     * If the workflow is skipped after the process stage has been executed it's handled like a skipped step.
     * 
     * @param reason
     */
    public skipWorkflow(reason: string): void {
        throw new SkipWorkflowException(reason);
    }

    /**
     * If in a loop the current iteration is cancelled and the next iteration is started. If the step is not part of a
     * loop the step is skipped.
     * 
     * @param reason
     */
    public continue(reason: string): void {
        if (this.workflowState.isInLoop()) {
            throw new ContinueException(reason);
        }

        this.skipStep(reason);
    }

    /**
     * If in a loop the loop is cancelled and the next step after the loop is executed. If the step is not part of a
     * loop the step is skipped.
     * 
     * @param reason
     */
    public break(reason: string): void {
        if (this.workflowState.isInLoop()) {
            throw new BreakException(reason);
        }

        this.skipStep(reason);
    }

    /**
     * Attach any additional debug info to your current step.
     * Info will be shown in the workflow debug log.
     * 
     * @param info
     * @param context May contain additional information which is evaluated in a custom output formatter
     */
    public attachStepInfo(info: string, context: Record<string, any> = {}): void {
        this.workflowState.getExecutionLog().attachStepInfo(info, context);
    }

    /**
     * Add a warning to the workflow.
     * All warnings will be collected and shown in the workflow debug log.
     * 
     * @param message
     * @param exception An exception causing the warning
     */
    public warning(message: string, exception?: Error): void {
        if (exception) {
            const exceptionClass = exception.constructor.name;
            message += ` (${exceptionClass}${exception.message ? `: ${exception.message}` : ''} in ${(exception as any).fileName || 'unknown'}:${(exception as any).lineNumber || 'unknown'})`;
        }

        this.workflowState.getExecutionLog().addWarning(message);
    }
}
