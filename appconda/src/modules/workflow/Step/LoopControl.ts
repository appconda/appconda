import { Describable } from "../State/ExecutionLog/Describable";
import { WorkflowContainer } from "../State/WorkflowContainer";
import { WorkflowControl } from "../WorkflowControl";


export interface LoopControl extends Describable {
    /**
     * Return true if the next iteration of the loop shall be executed. Return false to break the loop.
     * @param iteration The current iteration number.
     * @param control The workflow control object.
     * @param container The workflow container object.
     * @returns A boolean indicating whether to continue with the next iteration.
     */
    executeNextIteration(iteration: number, control: WorkflowControl, container: WorkflowContainer): boolean;
}
