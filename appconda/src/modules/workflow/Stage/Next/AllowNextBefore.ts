
import { WorkflowStep } from "../../Step/WorkflowStep";
import { Workflow } from "../../Workflow";
import { Before } from "../Before";

export interface IAllowNextBeforeMixin {
     before(step: WorkflowStep): Before;
}
export const AllowNextBeforeMixin =  {

    before: (step: WorkflowStep): Before => {
        (this as any).nextStage = new Before((this as any).workflow).before(step);
        return (this as any).nextStage;
    }
}
