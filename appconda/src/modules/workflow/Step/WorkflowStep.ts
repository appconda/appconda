import { Describable } from "../State/ExecutionLog/Describable";
import { WorkflowContainer } from "../State/WorkflowContainer";
import { WorkflowControl } from "../WorkflowControl";


export interface WorkflowStep extends Describable {
    /**
     * Implement the logic for your step
     * @param control - The control object for managing the workflow
     * @param container - The container holding the workflow state and data
     */
    run(control: WorkflowControl, container: WorkflowContainer): void;
}
