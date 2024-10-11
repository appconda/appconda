import { WorkflowException } from "../Exception/WorkflowException";
import { ExecutableWorkflow } from "../ExecutableWorkflow";
import { StepInfo } from "../State/ExecutionLog/StepInfo";
import { NestedContainer } from "../State/NestedContainer";
import { WorkflowContainer } from "../State/WorkflowContainer";
import { WorkflowResult } from "../State/WorkflowResult";
import { WorkflowControl } from "../WorkflowControl";
import { WorkflowStep } from "./WorkflowStep";

export class NestedWorkflow implements WorkflowStep {
    private nestedWorkflow: ExecutableWorkflow;
    private container: WorkflowContainer | null;
    private workflowResult: WorkflowResult | null = null;

    constructor(nestedWorkflow: ExecutableWorkflow, container: WorkflowContainer | null = null) {
        this.nestedWorkflow = nestedWorkflow;
        this.container = container;
    }

    public getDescription(): string {
        return "Execute nested workflow";
    }

    public async run(control: WorkflowControl, container: WorkflowContainer): Promise<void> {
        try {
            this.workflowResult = await this.nestedWorkflow.executeWorkflow(
                new NestedContainer(container, this.container),
                container.get('__internalExecutionConfiguration')?.throwOnFailure
            );
        } catch (exception) {
            if (exception instanceof WorkflowException) {
                this.workflowResult = exception.getWorkflowResult();
            } else {
                throw exception; // Re-throw if not a WorkflowException
            }
        }

        if (this.workflowResult) {
            control.attachStepInfo(StepInfo.NESTED_WORKFLOW, { result: this.workflowResult });

            const warnings = this.workflowResult.getWarnings();
            const warningCount = warnings.flat().length;

            if (warningCount > 0) {
                control.warning(
                    `Nested workflow '${this.workflowResult.getWorkflowName()}' emitted ${warningCount} warning${warningCount > 1 ? 's' : ''}`
                );
            }

            if (!this.workflowResult.success()) {
                control.failStep(`Nested workflow '${this.workflowResult.getWorkflowName()}' failed`);
            }
        }
    }

    public getNestedWorkflowResult(): WorkflowResult | null {
        return this.workflowResult;
    }
}
