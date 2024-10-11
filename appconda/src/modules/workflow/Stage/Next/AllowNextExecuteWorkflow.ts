import { SkipWorkflowException } from "../../Exception/WorkflowControl/SkipWorkflowException";
import { WorkflowException } from "../../Exception/WorkflowException";
import { ExecutionLog } from "../../State/ExecutionLog/ExecutionLog";
import { Summary } from "../../State/ExecutionLog/Summary";
import { WorkflowContainer } from "../../State/WorkflowContainer";
import { WorkflowResult } from "../../State/WorkflowResult";
import { WorkflowState } from "../../State/WorkflowState";

export interface IAllowNextExecuteWorkflow {
    executeWorkflow(
        workflowContainer: WorkflowContainer | null,
        throwOnFailure: boolean
    ): WorkflowResult;
}

export const AllowNextExecuteWorkflowMixin =  {
  
      executeWorkflow: async (
        workflowContainer: WorkflowContainer | null = null,
        throwOnFailure: boolean = true
    ): Promise<WorkflowResult> =>  {
        if (!workflowContainer) {
            workflowContainer = new WorkflowContainer();
        }

        workflowContainer.set('__internalExecutionConfiguration', {
            throwOnFailure: throwOnFailure,
        });

        const workflowState = new WorkflowState(workflowContainer);

        try {
            workflowState.getExecutionLog().startExecution();

            await (this as any).workflow.runStage(workflowState);

            workflowState.getExecutionLog().stopExecution();
            workflowState.setStage(WorkflowState.STAGE_SUMMARY);
            workflowState.addExecutionLog(new Summary('Workflow execution'));
        } catch (exception: any) {
            workflowState.getExecutionLog().stopExecution();
            workflowState.setStage(WorkflowState.STAGE_SUMMARY);
            workflowState.addExecutionLog(
                new Summary('Workflow execution'),
                exception instanceof SkipWorkflowException ? ExecutionLog.STATE_SKIPPED : ExecutionLog.STATE_FAILED,
                exception.message
            );

            if (exception instanceof SkipWorkflowException) {
                return workflowState.close(true);
            }

            const result = workflowState.close(false, exception);

            if (throwOnFailure) {
                throw new WorkflowException(
                    result,
                    `Workflow '${workflowState.getWorkflowName()}' failed`,
                    exception
                );
            }

            return result;
        }

        return workflowState.close(true);
    }
}
