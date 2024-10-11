import { Validate } from '../Stage/Validate';
import { WorkflowStep } from '../Step/WorkflowStep';
import { Workflow } from '../State/Workflow'; // Ensure this import is correct

export class AllowNextValidatorMixin {
    private workflow: Workflow;
    private nextStage: Validate | undefined;

    constructor(workflow: Workflow) {
        this.workflow = workflow;
    }

    public validate(step: WorkflowStep, hardValidator: boolean = false): Validate {
        this.nextStage = new Validate(this.workflow).validate(step, hardValidator);
        return this.nextStage;
    }
}
