import { WorkflowControl } from "../WorkflowControl";


export class ProfileStep {
    public invoke(next: () => any, control: WorkflowControl): any {
        const start = Date.now();
        const profile = () => {
            const elapsedTime = (Date.now() - start) / 1000; // in seconds
            control.attachStepInfo(`Step execution time: ${elapsedTime.toFixed(5)}s`);
        };

        try {
            const result = next();
            profile();
            return result;
        } catch (exception) {
            profile();
            throw exception;
        }
    }
}
