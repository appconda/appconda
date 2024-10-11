import { Describable } from './Describable';
import { StepInfo } from './StepInfo';


export class Step {
    private step: Describable;
    private state: string;
    private reason?: string;
    private stepInfo: StepInfo[];
    private warnings: number;

    constructor(step: Describable, state: string, reason: string | null, stepInfo: StepInfo[], warnings: number) {
        this.step = step;
        this.state = state;
        this.reason = reason ?? undefined;
        this.stepInfo = stepInfo;
        this.warnings = warnings;
    }

    public getDescription(): string {
        return this.step.getDescription();
    }

    public getState(): string {
        return this.state;
    }

    public getReason(): string | undefined {
        return this.reason;
    }

    public getStepInfo(): StepInfo[] {
        return this.stepInfo;
    }

    public getWarnings(): number {
        return this.warnings;
    }
}
