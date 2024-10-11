import { WorkflowState } from "../State/WorkflowState";
import { StepExecutionTrait } from "../Step/StepExecutionTrait";
import { Workflow } from "../Workflow";


export abstract class Stage extends StepExecutionTrait {
    protected nextStage: Stage | null = null;
    protected workflow: Workflow;

    constructor(workflow: Workflow) {
        super(); // Initialize StepExecutionTrait
        this.workflow = workflow;
    }

    protected abstract runStage(workflowState: WorkflowState): Stage | null;
}
