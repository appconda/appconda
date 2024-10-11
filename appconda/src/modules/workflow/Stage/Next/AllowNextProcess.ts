import { WorkflowStep } from "../../Step/WorkflowStep";
import { Process } from "../Process";

export interface IAllowNextProcess {
    process(step: WorkflowStep): Process;
}
export const AllowNextProcessMixin =  {
    
     process: (step: WorkflowStep): Process =>  {
        (this as any).nextStage = new Process( (this as any).workflow).process(step);
        return  (this as any).nextStage;
    }
}
