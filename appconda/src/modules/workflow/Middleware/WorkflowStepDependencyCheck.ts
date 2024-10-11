import { WorkflowContainer } from "../State/WorkflowContainer";
import { StepDependencyInterface } from "../Step/Dependency/StepDependencyInterface";
import { WorkflowStep } from "../Step/WorkflowStep";
import { WorkflowControl } from "../WorkflowControl";


export class WorkflowStepDependencyCheck {
    public async invoke(
        next: () => Promise<any> | any,
        control: WorkflowControl,
        container: WorkflowContainer,
        step: WorkflowStep
    ): Promise<any> {
        try {
            const method = step.run;
            const params = this.getFunctionParameters(method);

            const containerParameter = params[1]; // assuming the second parameter is the container

            if (containerParameter) {
                const dependencies = this.getStepDependencies(method);

                for (const dependency of dependencies) {
                    await dependency.check(container);
                }
            }

            return await next();
        } catch (error) {
            throw error;
        }
    }

    private getFunctionParameters(func: Function): any[] {
        // This is a placeholder for extracting function parameters.
        // JavaScript does not support reflection like PHP, so you may need to use a library or specific method to analyze function parameters.
        // This is simplified and may need adjustment based on actual requirements.
        return [];
    }

    private getStepDependencies(method: Function): StepDependencyInterface[] {
        // Placeholder to get dependencies from method annotations.
        // You may need a decorator or specific metadata approach depending on your setup.
        return [];
    }
}
