import { WorkflowContainer } from './WorkflowContainer';
import { WorkflowResult } from './WorkflowResult';
import { WorkflowException } from './WorkflowException';

export interface ExecutableWorkflow {
    /**
     * Executes the workflow and returns the result.
     * @param workflowContainer - Optional container for workflow state and data.
     * @param throwOnFailure - Whether to throw an exception on failure.
     * @throws WorkflowException if an error occurs during workflow execution and `throwOnFailure` is true.
     */
    executeWorkflow(
        workflowContainer?: WorkflowContainer,
        throwOnFailure?: boolean
    ): WorkflowResult;
}
