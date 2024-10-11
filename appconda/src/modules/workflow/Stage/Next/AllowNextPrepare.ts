import { WorkflowStep } from "../../Step/WorkflowStep";
import { Prepare } from "../Prepare";

export interface IAllowNextPrepare {
    prepare(step: WorkflowStep): Prepare;
}
export const AllowNextPrepareMixin =  {
    prepare : (step: WorkflowStep): Prepare => {
        (this as any).nextStage = new Prepare((this as any).workflow).prepare(step);
        return (this as any).nextStage;
    }
}
