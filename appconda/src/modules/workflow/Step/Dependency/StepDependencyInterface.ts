import { WorkflowContainer } from "../../State/WorkflowContainer";

export interface StepDependencyInterface {
    check(container: WorkflowContainer): void;
}
