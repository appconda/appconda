import { Step } from '../State/ExecutionLog';

export interface OutputFormat {
    /**
     * Formats the workflow and steps into a specific output format.
     * 
     * @param workflowName - The name of the workflow.
     * @param steps - A list of executed steps, grouped by stages.
     * 
     * @returns The formatted output.
     */
    format(workflowName: string, steps: Record<string, Step[]>): string;
}
