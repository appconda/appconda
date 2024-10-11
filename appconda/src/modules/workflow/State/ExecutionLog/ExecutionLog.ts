
import { WorkflowState } from '../WorkflowState';
import { Describable } from './Describable';
import { OutputFormat } from './OutputFormat/OutputFormat';
import { Step } from './Step';
import { StepInfo } from './StepInfo';

export class ExecutionLog {
    public static readonly STATE_SUCCESS = 'ok';
    public static readonly STATE_SKIPPED = 'skipped';
    public static readonly STATE_FAILED = 'failed';

    private stages: Map<number, Step[]> = new Map();
    private stepInfo: StepInfo[] = [];
    private warnings: Map<number, string[]> = new Map();
    private warningsDuringStep: number = 0;

    private startAt: number = 0;
    private workflowState: WorkflowState;

    constructor(workflowState: WorkflowState) {
        this.workflowState = workflowState;
    }

    public addStep(stage: number, step: Describable, state: string, reason?: string): void {
        const stepInstance = new Step(step, state, reason as any, this.stepInfo, this.warningsDuringStep);
        if (!this.stages.has(stage)) {
            this.stages.set(stage, []);
        }
        this.stages.get(stage)!.push(stepInstance);
        this.stepInfo = [];
        this.warningsDuringStep = 0;
    }

    public debug(formatter: OutputFormat): string {
        return formatter.format(this.workflowState.getWorkflowName(), Array.from(this.stages.entries()) as any);
    }

    public attachStepInfo(info: string, context: Record<string, any> = {}): void {
        this.stepInfo.push(new StepInfo(info, context));
    }

    public addWarning(message: string, workflowReportWarning = false): void {
        if (!this.warnings.has(this.workflowState.getStage())) {
            this.warnings.set(this.workflowState.getStage(), []);
        }
        this.warnings.get(this.workflowState.getStage())!.push(message);

        if (!workflowReportWarning) {
            this.warningsDuringStep++;
        }
    }

    public startExecution(): void {
        this.startAt = Date.now();
    }

    public stopExecution(): void {
        this.attachStepInfo(`Execution time: ${(Date.now() - this.startAt) / 1000}ms`);

        if (this.warnings.size > 0) {
            let warnings = `Got ${this.countWarnings()} warning${this.countWarnings() > 1 ? 's' : ''} during the execution:`;

            this.warnings.forEach((stageWarnings, stage) => {
                warnings += stageWarnings.map(
                    warning => `\n        ${ExecutionLog.mapStage(stage)}: ${warning}`
                ).join('');
            });

            this.attachStepInfo(warnings);
        }
    }

    private countWarnings(): number {
        return Array.from(this.warnings.values()).flat().length;
    }

    public static mapStage(stage: number): string {
        switch (stage) {
            case WorkflowState.STAGE_PREPARE: return 'Prepare';
            case WorkflowState.STAGE_VALIDATE: return 'Validate';
            case WorkflowState.STAGE_BEFORE: return 'Before';
            case WorkflowState.STAGE_PROCESS: return 'Process';
            case WorkflowState.STAGE_ON_ERROR: return 'On Error';
            case WorkflowState.STAGE_ON_SUCCESS: return 'On Success';
            case WorkflowState.STAGE_AFTER: return 'After';
            case WorkflowState.STAGE_SUMMARY: return 'Summary';
            default: return 'Unknown';
        }
    }

    public getWarnings(): Map<number, string[]> {
        return this.warnings;
    }

    public getLastStep(): Describable {
        return this.workflowState.getCurrentStep();
    }
}
