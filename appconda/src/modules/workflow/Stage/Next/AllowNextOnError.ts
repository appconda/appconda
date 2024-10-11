import { WorkflowStep } from "../../Step/WorkflowStep";
import { Workflow } from "../../Workflow";
import { OnError } from "../OnError";

export interface IAllowNextOnError {
    onError(step: WorkflowStep): OnError;
}
export const AllowNextOnErrorMixin = {
    onError: (step: WorkflowStep): OnError => {
        (this as any).nextStage = new OnError((this as any).workflow).onError(step);
        return (this as any).nextStage;
    }
}
