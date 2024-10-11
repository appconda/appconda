import { ExecutableWorkflow } from "../ExecutableWorkflow";
import { WorkflowState } from "../State/WorkflowState";
import { WorkflowStep } from "../Step/WorkflowStep";
import { Workflow } from "../Workflow";
import { MultiStepStage } from "./MultiStepStage";
import { AllowNextExecuteWorkflowMixin, IAllowNextExecuteWorkflow } from "./Next/AllowNextExecuteWorkflow";

export class After extends MultiStepStage implements ExecutableWorkflow {
    public static readonly STAGE = WorkflowState.STAGE_AFTER;

    constructor(workflow: Workflow) {
        super(workflow);
    }

    executeWorkflow(workflowContainer?: Workflow, throwOnFailure?: boolean) {
        throw new Error("Method not implemented.");
    }

    public after(step: WorkflowStep): this {
        return this.addStep(step);
    }

    // The following method is part of AllowNextExecuteWorkflowMixin
    // So you should ensure the mixin methods are available in this class
}

// Apply the mixin to the class
Object.assign(After.prototype, AllowNextExecuteWorkflowMixin);
