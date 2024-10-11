
import { MultiStepStage } from './MultiStepStage';
import { AllowNextOnSuccessMixin } from './Next/AllowNextOnSuccess';
import { AllowNextAfterMixin } from './Next/AllowNextAfter';
import { AllowNextExecuteWorkflowMixin } from './Next/AllowNextExecuteWorkflow';
import { ExecutableWorkflow } from '../ExecutableWorkflow';
import { WorkflowState } from '../State/WorkflowState';
import { WorkflowStep } from '../Step/WorkflowStep';
import { Stage } from './Stage';

export class OnError extends MultiStepStage implements ExecutableWorkflow {
    private static readonly STAGE: number = WorkflowState.STAGE_ON_ERROR;

    public onError(step: WorkflowStep): this {
        return this.addStep(step);
    }

    protected runStage(workflowState: WorkflowState): Stage | null {
        // don't execute onError steps if the workflow was successful
        if (!workflowState.getProcessException()) {
            return this.nextStage;
        }

        return super.runStage(workflowState);
    }
}

// Include the necessary imports for the traits
Object.assign(OnError.prototype, AllowNextOnSuccessMixin, AllowNextAfterMixin, AllowNextExecuteWorkflowMixin);
