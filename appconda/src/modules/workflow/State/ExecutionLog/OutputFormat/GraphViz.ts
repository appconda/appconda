import { WorkflowResult } from "../../WorkflowResult";
import { ExecutionLog } from "../ExecutionLog";
import { Step } from "../Step";
import { StepInfo } from "../StepInfo";
import { OutputFormat } from "./OutputFormat";

export class GraphViz implements OutputFormat {
    private static stepIndex = 0;
    private static clusterIndex = 0;

    private static loopIndex = 0;
    private static loopInitialElement: number[] = [];
    private static loopLinks: Record<number, number> = {};

    public format(workflowName: string, steps: Record<string, Step[]>): string {
        let dotScript = `digraph "${workflowName}" {\n`;

        dotScript += this.renderWorkflowGraph(workflowName, steps);

        for (let i = 0; i < GraphViz.stepIndex - 1; i++) {
            if (GraphViz.loopLinks[i + 1] !== undefined) {
                continue;
            }

            dotScript += `  ${i} -> ${i + 1}\n`;
        }

        for (const [loopElement, loopRoot] of Object.entries(GraphViz.loopLinks)) {
            dotScript += `  ${loopRoot} -> ${loopElement}\n`;
        }

        dotScript += '}';

        return dotScript;
    }

    private renderWorkflowGraph(workflowName: string, steps: Record<string, Step[]>): string {
        let dotScript = `  ${GraphViz.stepIndex++} [label="${workflowName}"]\n`;
        for (const [stage, stageSteps] of Object.entries(steps)) {
            dotScript += `  subgraph cluster_${GraphViz.clusterIndex++} {\n    label = "${ExecutionLog.mapStage(stage)}"\n`;

            for (const step of stageSteps) {
                for (const info of step.getStepInfo()) {
                    switch (info.getInfo()) {
                        case StepInfo.LOOP_START:
                            dotScript += `  subgraph cluster_loop_${GraphViz.clusterIndex++} {\n    label = "Loop"\n`;
                            GraphViz.loopInitialElement[++GraphViz.loopIndex] = GraphViz.stepIndex;
                            continue;

                        case StepInfo.LOOP_ITERATION:
                            GraphViz.loopLinks[GraphViz.stepIndex + 1] = GraphViz.loopInitialElement[GraphViz.loopIndex];
                            continue;

                        case StepInfo.LOOP_END:
                            dotScript += `\n  }\n`;
                            GraphViz.loopIndex--;
                            continue;

                        case StepInfo.NESTED_WORKFLOW:
                            const nestedWorkflowResult = info.getContext()['result'] as WorkflowResult;
                            const nestedWorkflowGraph = nestedWorkflowResult.debug(this);

                            const lines = nestedWorkflowGraph.split('\n');
                            lines.shift(); // Remove first line
                            lines.pop();   // Remove last line

                            dotScript += `  subgraph cluster_${GraphViz.clusterIndex++} {\n    label = "Nested workflow"\n`
                                + lines.join('\n')
                                + `\n  }\n`;

                            continue;
                    }
                }

                dotScript += `    ${GraphViz.stepIndex++} [label=${this.formatStepLabel(step)} shape="box" color="${this.mapColor(step)}"]\n`;
            }
            dotScript += `  }\n`;
        }

        return dotScript;
    }

    private formatStepLabel(step: Step): string {
        return `<${step.getDescription()} (${step.getState()})`
            + (step.getReason() ? `<BR/><FONT POINT-SIZE="10">${step.getReason()}</FONT>` : '')
            + step.getStepInfo().map(info => `<BR/><FONT POINT-SIZE="10">${info.getInfo()}</FONT>`).join('')
            + '>';
    }

    private mapColor(step: Step): string {
        if (step.getState() === ExecutionLog.STATE_SUCCESS && step.getWarnings().length > 0) {
            return 'yellow';
        }

        return {
            [ExecutionLog.STATE_SUCCESS]: 'green',
            [ExecutionLog.STATE_SKIPPED]: 'grey',
            [ExecutionLog.STATE_FAILED]: 'red',
        }[step.getState()] as any;
    }
}
