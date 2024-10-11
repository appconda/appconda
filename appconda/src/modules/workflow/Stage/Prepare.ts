import { MultiStepStage } from './MultiStepStage';

import { AllowNextValidatorMixin } from './Next/AllowNextValidator';
import { AllowNextBeforeMixin } from './Next/AllowNextBefore';
import { AllowNextProcessMixin } from './Next/AllowNextProcess';
import { WorkflowState } from '../State/WorkflowState';
import { WorkflowStep } from '../Step/WorkflowStep';
import { Stage } from './Stage';

export class Prepare extends MultiStepStage {
    private static readonly STAGE: number = WorkflowState.STAGE_PREPARE;

    

    public prepare(step: WorkflowStep): this {
        return this.addStep(step);
    }

    protected runStage(workflowState: WorkflowState): Stage | null {
        // Execute the stage
        return super.runStage(workflowState);
    }
}

// Include the necessary imports for the traits
Object.assign(Prepare.prototype, AllowNextValidatorMixin, AllowNextBeforeMixin, AllowNextProcessMixin);
