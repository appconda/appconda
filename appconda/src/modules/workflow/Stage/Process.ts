import { MultiStepStage } from './MultiStepStage';

import { AllowNextOnSuccessMixin, IAllowNextOnSuccess } from './Next/AllowNextOnSuccess';
import { AllowNextOnErrorMixin, IAllowNextOnError } from './Next/AllowNextOnError';
import { AllowNextAfterMixin, IAllowNextAfter } from './Next/AllowNextAfter';
import { AllowNextExecuteWorkflowMixin, IAllowNextExecuteWorkflow } from './Next/AllowNextExecuteWorkflow';
import { ExecutableWorkflow } from '../ExecutableWorkflow';
import { WorkflowState } from '../State/WorkflowState';
import { WorkflowStep } from '../Step/WorkflowStep';
import { Stage } from './Stage';
import { OnSuccess } from './OnSuccess';
import { OnError } from './OnError';
import { After } from './After';
import { WorkflowContainer } from '../State/WorkflowContainer';

export class Process extends MultiStepStage implements ExecutableWorkflow, IAllowNextOnSuccess, IAllowNextOnError, IAllowNextAfter {
    
    executeWorkflow(workflowContainer?: WorkflowContainer, throwOnFailure?: boolean) {
        throw new Error('Method not implemented.');
    }
    after(step: WorkflowStep): After {
        throw new Error('Method not implemented.');
    }
    onError(step: WorkflowStep): OnError {
        throw new Error('Method not implemented.');
    }
    onSuccess(step: WorkflowStep): OnSuccess {
        throw new Error('Method not implemented.');
    }

    protected static readonly STAGE: number = WorkflowState.STAGE_PROCESS;

    public process(step: WorkflowStep): this {
        return this.addStep(step);
    }

    protected runStage(workflowState: WorkflowState): Stage | null {
        try {
            super.runStage(workflowState);
        } catch (exception: any) {
            workflowState.setProcessException(exception);
        }

        return this.nextStage;
    }
}

// Include the necessary imports for the traits
Object.assign(Process.prototype, AllowNextOnSuccessMixin, AllowNextOnErrorMixin, AllowNextAfterMixin, AllowNextExecuteWorkflowMixin);
