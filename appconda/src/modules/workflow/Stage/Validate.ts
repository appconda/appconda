
import { Stage } from './Stage';
import { AllowNextBeforeMixin } from './Next/AllowNextBefore'; // Assume proper paths
import { AllowNextProcessMixin } from './Next/AllowNextProcess'
import { WorkflowValidationException } from '../Exception/WorkflowValidationException';
import { SkipWorkflowException } from '../Exception/WorkflowControl/SkipWorkflowException';
import { Validator } from '../Validator';
import { WorkflowStep } from '../Step/WorkflowStep';
import { WorkflowState } from '../State/WorkflowState';

export class Validate extends Stage {
    private validators: Validator[] = [];

    public validate(step: WorkflowStep, hardValidator: boolean = false): this {
        this.validators.push(new Validator(step, hardValidator));
        return this;
    }

    protected runStage(workflowState: WorkflowState): Stage | null {
        workflowState.setStage(WorkflowState.STAGE_VALIDATE);

        // Make sure hard validators are executed first
        this.validators.sort((a, b) => {
            if (a.isHardValidator() !== b.isHardValidator()) {
                return a.isHardValidator() ? -1 : 1;
            }
            return 0;
        });

        const validationErrors: Error[] = [];
        for (const validator of this.validators) {
            workflowState.setStep(validator.getStep());

            try {
                this.wrapStepExecution(validator.getStep(), workflowState);
            } catch (error: any) {
                if (error instanceof SkipWorkflowException) {
                    throw error;
                } else {
                    validationErrors.push(error);
                }
            }
        }

        if (validationErrors.length > 0) {
            throw new WorkflowValidationException(validationErrors);
        }

        return this.nextStage;
    }
}

Object.assign(Validate.prototype, AllowNextBeforeMixin,AllowNextProcessMixin );
