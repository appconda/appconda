import { MultiStepStage } from './MultiStepStage'; // Ensure this import is correct
import { AllowNextProcessMixin, IAllowNextProcess } from '../Stage/Next/AllowNextProcess';
import { WorkflowState } from '../State/WorkflowState';
import { WorkflowStep } from '../Step/WorkflowStep';
import { Workflow } from '../Workflow';
import { Process } from './Process';

export class Before extends MultiStepStage implements IAllowNextProcess {
    protected static readonly STAGE = WorkflowState.STAGE_BEFORE;

    constructor(workflow: Workflow) {
        super(workflow);
    }
    
    process(step: WorkflowStep): Process {
        throw new Error('Method not implemented.');
    }

    public before(step: WorkflowStep): this {
        return this.addStep(step);
    }

    // The following methods are part of AllowNextProcessMixin
    // Ensure the mixin methods are available in this class
}

// Apply the mixin to the class
Object.assign(Before.prototype, AllowNextProcessMixin);
