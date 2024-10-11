import { FailStepException } from "../Exception/WorkflowControl/FailStepException";
import { LoopControlException } from "../Exception/WorkflowControl/LoopControlException";
import { SkipStepException } from "../Exception/WorkflowControl/SkipStepException";
import { SkipWorkflowException } from "../Exception/WorkflowControl/SkipWorkflowException";
import { ExecutionLog } from "../State/ExecutionLog/ExecutionLog";
import { WorkflowState } from "../State/WorkflowState";
import { WorkflowStep } from "./WorkflowStep";

export interface IStepExecution {
    async wrapStepExecution(step: WorkflowStep, workflowState: WorkflowState): Promise<void>;
}
export class StepExecutionTrait {
    protected async wrapStepExecution(step: WorkflowStep, workflowState: WorkflowState): Promise<void> {
        try {
            const middleware = this.resolveMiddleware(step, workflowState);
            await middleware();

        } catch (exception: any) {
            if (exception instanceof SkipStepException || exception instanceof FailStepException) {
                workflowState.addExecutionLog(
                    step,
                    exception instanceof FailStepException ? ExecutionLog.STATE_FAILED : ExecutionLog.STATE_SKIPPED,
                    exception.message,
                );

                if (exception instanceof FailStepException) {
                    // Cancel the workflow during preparation
                    if (workflowState.getStage() <= WorkflowState.STAGE_PROCESS) {
                        throw exception;
                    }

                    workflowState.getExecutionLog().addWarning(`Step failed (${step.constructor.name})`, true);
                }

                // Bubble up the exception so the loop control can handle the exception
                if (exception instanceof LoopControlException) {
                    throw exception;
                }

                return;
            } catch (exception) {
                workflowState.addExecutionLog(
                    step,
                    exception instanceof SkipWorkflowException ? ExecutionLog.STATE_SKIPPED : ExecutionLog.STATE_FAILED,
                    exception.message,
                );

                // Cancel the workflow during preparation
                if (workflowState.getStage() <= WorkflowState.STAGE_PROCESS) {
                    throw exception;
                }

                if (!(exception instanceof SkipWorkflowException)) {
                    workflowState.getExecutionLog().addWarning(`Step failed (${step.constructor.name})`, true);
                }

                return;
            }

            workflowState.addExecutionLog(step);
        }
    }

    private resolveMiddleware(step: WorkflowStep, workflowState: WorkflowState): () => Promise<void> {
        let tip = async () => {
            await step.run(workflowState.getWorkflowControl(), workflowState.getWorkflowContainer());
        };

        const middlewares = workflowState.getMiddlewares();

        if (process.version.startsWith('v8')) {
            middlewares.unshift(new WorkflowStepDependencyCheck());
        }

        for (const middleware of middlewares) {
            const currentTip = tip;
            tip = async () => {
                await middleware(
                    currentTip,
                    workflowState.getWorkflowControl(),
                    workflowState.getWorkflowContainer(),
                    step,
                );
            };
        }

        return tip;
    }
}
