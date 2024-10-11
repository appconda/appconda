
import { WorkflowResult } from '../../WorkflowResult';
import { WorkflowState } from '../../WorkflowState';
import { ExecutionLog } from '../ExecutionLog';
import { Step } from '../Step';
import { StepInfo } from '../StepInfo';
import { OutputFormat } from './OutputFormat';



export class StringLog implements OutputFormat {
    private indentation: string = '';

    public format(workflowName: string, steps: Record<string, Step[]>): string {
        let debug = `Process log for workflow '${workflowName}':\n`;

        for (const [stage, stageSteps] of Object.entries(steps)) {
            debug += `${stage === WorkflowState.STAGE_SUMMARY as any ? '\n' : ''}${this.indentation}${ExecutionLog.mapStage(stage as any)}:\n`;

            for (const step of stageSteps) {
                debug += `${this.indentation}  - ${this.formatStep(step)}\n`;
            }
        }

        return debug.trim();
    }

    private formatStep(step: Step): string {
        let stepLog = `${step.getDescription()}: ${step.getState()}` +
            (step.getReason() ? ` (${step.getReason()})` : '') +
            (step.getWarnings()
                ? ` (${step.getWarnings()} warning${step.getWarnings() > 1 ? 's' : ''})`
                : ''
            );

        for (const info of step.getStepInfo()) {
            const formattedInfo = this.formatInfo(info);

            if (formattedInfo) {
                stepLog += `\n${formattedInfo}`;
            }
        }

        return stepLog;
    }

    private formatInfo(info: StepInfo): string | null {
        switch (info.getInfo()) {
            case StepInfo.NESTED_WORKFLOW:
                const nestedWorkflowResult = info.getContext()['result'] as WorkflowResult;

                return `${this.indentation}    - ${nestedWorkflowResult.debug(this)
                    .replace(/\n      \n/g, '\n\n')
                    .replace(/\n/g, '\n      ')}`;
            case StepInfo.LOOP_START:
                this.indentation += '  ';
                return null;
            case StepInfo.LOOP_ITERATION:
                return null;
            case StepInfo.LOOP_END:
                this.indentation = this.indentation.slice(0, -2);
                const iterations = info.getContext()['iterations'];

                return `      - Loop finished after ${iterations} iteration${iterations === 1 ? '' : 's'}`;
            default:
                return `${this.indentation}    - ${info.getInfo()}`;
        }
    }
}
