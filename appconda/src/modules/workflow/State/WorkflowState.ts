
import { Describable } from './ExecutionLog/Describable';
import { ExecutionLog } from './ExecutionLog/ExecutionLog';
import { WorkflowContainer } from './WorkflowContainer';
import { WorkflowResult } from './WorkflowResult';

export class WorkflowState {
    public static readonly STAGE_PREPARE = 0;
    public static readonly STAGE_VALIDATE = 1;
    public static readonly STAGE_BEFORE = 2;
    public static readonly STAGE_PROCESS = 3;
    public static readonly STAGE_ON_ERROR = 4;
    public static readonly STAGE_ON_SUCCESS = 5;
    public static readonly STAGE_AFTER = 6;
    public static readonly STAGE_SUMMARY = 7;

    private processException: Error | null = null;
    private workflowName: string = '';
    private stage: number = WorkflowState.STAGE_PREPARE;
    private inLoop: number = 0;

    private workflowControl: WorkflowControl;
    private workflowContainer: WorkflowContainer;
    private executionLog: ExecutionLog;

    private middlewares: any[] = [];

    private static runningWorkflows: WorkflowState[] = [];
    private currentStep: WorkflowStep;

    constructor(workflowContainer: WorkflowContainer) {
        this.executionLog = new ExecutionLog(this);
        this.workflowControl = new WorkflowControl(this);
        this.workflowContainer = workflowContainer;

        WorkflowState.runningWorkflows.push(this);
    }

    public close(success: boolean, exception: Error | null = null): WorkflowResult {
        WorkflowState.runningWorkflows.pop();
        return new WorkflowResult(this, success, exception);
    }

    public static getRunningWorkflow(): WorkflowState | null {
        return WorkflowState.runningWorkflows.length > 0 
            ? WorkflowState.runningWorkflows[WorkflowState.runningWorkflows.length - 1] 
            : null;
    }

    public getProcessException(): Error | null {
        return this.processException;
    }

    public setProcessException(processException: Error | null): void {
        this.processException = processException;
    }

    public getStage(): number {
        return this.stage;
    }

    public setStage(stage: number): void {
        this.stage = stage;
    }

    public getWorkflowName(): string {
        return this.workflowName;
    }

    public setWorkflowName(workflowName: string): void {
        this.workflowName = workflowName;
    }

    public getWorkflowControl(): WorkflowControl {
        return this.workflowControl;
    }

    public getWorkflowContainer(): WorkflowContainer {
        return this.workflowContainer;
    }

    public addExecutionLog(
        step: Describable,
        state: string = ExecutionLog.STATE_SUCCESS,
        reason: string | null = null
    ): void {
        this.executionLog.addStep(this.stage, step, state, reason);
    }

    public getExecutionLog(): ExecutionLog {
        return this.executionLog;
    }

    public setMiddlewares(middlewares: any[]): void {
        this.middlewares = middlewares;
    }

    public getMiddlewares(): any[] {
        return this.middlewares;
    }

    public isInLoop(): boolean {
        return this.inLoop > 0;
    }

    public setInLoop(inLoop: boolean): void {
        this.inLoop += inLoop ? 1 : -1;
    }

    public setStep(step: WorkflowStep): void {
        this.currentStep = step;
    }

    public getCurrentStep(): WorkflowStep {
        return this.currentStep;
    }
}
