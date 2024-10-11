
import { MultiStepStage } from './MultiStepStage';
import { AllowNextOnErrorMixin } from './Next/AllowNextOnError';
import { AllowNextAfterMixin } from './Next/AllowNextAfter';
import { AllowNextExecuteWorkflowMixin } from './Next/AllowNextExecuteWorkflow';
import { ExecutableWorkflow } from '../ExecutableWorkflow';
import { WorkflowState } from '../State/WorkflowState';
import { WorkflowStep } from '../Step/WorkflowStep';
import { Stage } from './Stage';

export class OnSuccess extends MultiStepStage implements ExecutableWorkflow {
    private static readonly STAGE: number = WorkflowState.STAGE_ON_SUCCESS;



    public onSuccess(step: WorkflowStep): this {
        return this.addStep(step);
    }

    protected runStage(workflowState: WorkflowState): Stage | null {
        // don't execute onSuccess steps if the workflow failed
        if (workflowState.getProcessException()) {
            return this.nextStage;
        }

        return super.runStage(workflowState);
    }
}

// Include the necessary imports for the traits
Object.assign(OnSuccess.prototype, AllowNextOnErrorMixin, AllowNextAfterMixin, AllowNextExecuteWorkflowMixin);
