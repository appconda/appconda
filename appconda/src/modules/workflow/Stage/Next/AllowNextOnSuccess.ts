import { WorkflowStep } from "../../Step/WorkflowStep";
import { Workflow } from "../../Workflow";
import { OnSuccess } from "../OnSuccess";

export interface IAllowNextOnSuccess {
    onSuccess(step: WorkflowStep): OnSuccess;
}

export const AllowNextOnSuccessMixin = {

    onSuccess: (step: WorkflowStep): OnSuccess => {
        (this as any).nextStage = new OnSuccess((this as any).workflow).onSuccess(step);
        return (this as any).nextStage;
    }
}
