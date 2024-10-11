export class StepInfo {
    public static readonly NESTED_WORKFLOW = 'STEP_NESTED_WORKFLOW';
    public static readonly LOOP_START = 'STEP_LOOP_START';
    public static readonly LOOP_ITERATION = 'STEP_LOOP_ITERATION';
    public static readonly LOOP_END = 'STEP_LOOP_END';

    private info: string;
    private context: Record<string, any>;

    constructor(info: string, context: Record<string, any>) {
        this.info = info;
        this.context = context;
    }

    public getInfo(): string {
        return this.info;
    }

    public getContext(): Record<string, any> {
        return this.context;
    }
}
