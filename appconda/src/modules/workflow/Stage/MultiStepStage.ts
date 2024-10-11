import { WorkflowState } from "../State/WorkflowState";
import { WorkflowStep } from "../Step/WorkflowStep";
import { Stage } from "./Stage";


export abstract class MultiStepStage extends Stage {
   

    private steps: WorkflowStep[] = [];

    protected addStep(step: WorkflowStep): this {
        this.steps.push(step);
        return this;
    }

    protected runStage(workflowState: WorkflowState): Stage | null {
        workflowState.setStage((this.constructor as typeof MultiStepStage).STAGE);

        for (const step of this.steps) {
            workflowState.setStep(step);
            this.wrapStepExecution(step, workflowState);
        }

        return this.nextStage;
    }

}
