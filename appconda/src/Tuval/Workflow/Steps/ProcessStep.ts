import { Workflow } from "../Workflow";
import { Process } from "../Path";

export abstract class ProcessStep {
    stepId: string;
    nextStep: string | number = '';
    exceptionStepId: string = '';
    params: any;
    constructor(stepId: string, nextStep: string, params?: any) {
        this.stepId = stepId;
        this.nextStep = nextStep;
        this.params = params;
    }
    abstract run(path: Process, flow: Workflow): any;
}