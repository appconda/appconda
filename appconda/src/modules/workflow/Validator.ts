import { WorkflowStep } from './WorkflowStep';

export class Validator {
    private step: WorkflowStep;
    private hardValidator: boolean;

    constructor(step: WorkflowStep, hardValidator: boolean) {
        this.step = step;
        this.hardValidator = hardValidator;
    }

    public getStep(): WorkflowStep {
        return this.step;
    }

    public isHardValidator(): boolean {
        return this.hardValidator;
    }
}
