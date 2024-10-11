import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GraphViz } from './GraphViz';  // Import the GraphViz class
import { Step } from '../Step';

const execPromise = promisify(exec);

export class WorkflowGraph {
    private path: string;

    constructor(path: string) {
        this.path = path;
    }

    public async format(workflowName: string, steps:  Record<string, Step[]>): Promise<string> {
        const graphViz = new GraphViz();
        const script = graphViz.format(workflowName, steps);
        const filePath = path.join(this.path, `${workflowName}_${Date.now()}.svg`);

        await this.generateImageFromScript(script, filePath);

        return filePath;
    }

    private async generateImageFromScript(script: string, file: string): Promise<void> {
        const tmp = path.join(await fs.mkdtemp(path.join('/tmp', 'graphviz-')), 'script.dot');

        try {
            await fs.writeFile(tmp, script, { encoding: 'utf8' });

            const { stderr } = await execPromise(`dot -T svg ${tmp} -o ${file}`);
            if (stderr) {
                throw new Error(`Error generating image: ${stderr}`);
            }
        } finally {
            await fs.unlink(tmp);
        }
    }
}
