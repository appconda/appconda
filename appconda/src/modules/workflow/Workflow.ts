
import { AllowNextPrepareMixin } from './Stage/Next/AllowNextPrepare';
import { AllowNextValidatorMixin } from './Stage/Next/AllowNextValidator';
import { AllowNextBeforeMixin } from './Stage/Next/AllowNextBefore';
import { AllowNextProcessMixin } from './Stage/Next/AllowNextProcess';
import { Stage } from './Stage/Stage';
import { WorkflowState } from './State/WorkflowState';

export class Workflow extends Stage {
    private name: string;
    private middleware: Array<() => void>;

    constructor(name: string, ...middlewares: Array<() => void>) {
        
       super(this)
        this.name = name;
        this.middleware = middlewares;
    }

    protected runStage(workflowState: WorkflowState): Stage | null {
        workflowState.setWorkflowName(this.name);
        workflowState.setMiddlewares(this.middleware);

        let nextStage: Stage | null = this.nextStage;
        while (nextStage) {
            nextStage = nextStage.runStage(workflowState);
        }

        const processException = workflowState.getProcessException();
        if (processException) {
            throw processException;
        }

        return null;
    }
}

Object.assign(Workflow.prototype, AllowNextPrepareMixin.prototype, AllowNextValidatorMixin.prototype, AllowNextBeforeMixin.prototype, AllowNextProcessMixin.prototype);