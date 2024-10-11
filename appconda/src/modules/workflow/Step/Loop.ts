

import { BreakException } from '../Exception/WorkflowControl/BreakException';
import { ContinueException } from '../Exception/WorkflowControl/ContinueException';
import { FailWorkflowException } from '../Exception/WorkflowControl/FailWorkflowException';
import { SkipWorkflowException } from '../Exception/WorkflowControl/SkipWorkflowException';
import { ExecutionLog } from '../State/ExecutionLog/ExecutionLog';
import { StepInfo } from '../State/ExecutionLog/StepInfo';
import { Summary } from '../State/ExecutionLog/Summary';
import { WorkflowContainer } from '../State/WorkflowContainer';
import { WorkflowState } from '../State/WorkflowState';
import { WorkflowControl } from '../WorkflowControl';
import { LoopControl } from './LoopControl';
import { IStepExecution, StepExecutionTrait } from './StepExecutionTrait';
import { WorkflowStep } from './WorkflowStep';

export class Loop implements WorkflowStep, IStepExecution {
    private steps: WorkflowStep[] = [];
    private loopControl: LoopControl;
    private continueOnError: boolean;

    constructor(loopControl: LoopControl, continueOnError = false) {
        this.loopControl = loopControl;
        this.continueOnError = continueOnError;
    }
    public async wrapStepExecution(step: WorkflowStep, workflowState: WorkflowState): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public addStep(step: WorkflowStep): this {
        this.steps.push(step);
        return this;
    }

    public getDescription(): string {
        return this.loopControl.getDescription();
    }

    public async run(control: WorkflowControl, container: WorkflowContainer): Promise<void> {
        let iteration = 0;

        WorkflowState.getRunningWorkflow()?.setInLoop(true);
        control.attachStepInfo(StepInfo.LOOP_START, { description: this.loopControl.getDescription() });
        WorkflowState.getRunningWorkflow()?.addExecutionLog(new Summary('Start Loop'));

        while (true) {
            let loopState = ExecutionLog.STATE_SUCCESS;
            let reason: string | null = null;

            try {
                if (!(await this.loopControl.executeNextIteration(iteration, control, container))) {
                    break;
                }

                for (const step of this.steps) {
                    await this.wrapStepExecution(step, WorkflowState.getRunningWorkflow()!);
                }

                iteration++;
            } catch (exception) {
                iteration++;
                reason = (exception as Error).message;

                if (exception instanceof ContinueException) {
                    loopState = ExecutionLog.STATE_SKIPPED;
                } else {
                    if (exception instanceof BreakException) {
                        WorkflowState.getRunningWorkflow()?.addExecutionLog(
                            new Summary(`Loop iteration #${iteration}`),
                            ExecutionLog.STATE_SKIPPED,
                            reason
                        );

                        control.attachStepInfo(`Loop break in iteration #${iteration}`);

                        break;
                    }

                    if (!this.continueOnError ||
                        exception instanceof SkipWorkflowException ||
                        exception instanceof FailWorkflowException
                    ) {
                        control.attachStepInfo(StepInfo.LOOP_ITERATION, { iteration });
                        control.attachStepInfo(StepInfo.LOOP_END, { iterations: iteration });

                        throw exception;
                    }

                    control.warning(`Loop iteration #${iteration} failed. Continued execution.`);
                    loopState = ExecutionLog.STATE_FAILED;
                }
            }

            control.attachStepInfo(StepInfo.LOOP_ITERATION, { iteration });

            WorkflowState.getRunningWorkflow()?.addExecutionLog(new Summary(`Loop iteration #${iteration}`), loopState, reason);
        }
        WorkflowState.getRunningWorkflow()?.setInLoop(false);

        control.attachStepInfo(StepInfo.LOOP_END, { iterations: iteration });
    }
}


// Include the necessary imports for the traits
Object.assign(Loop.prototype, StepExecutionTrait);
