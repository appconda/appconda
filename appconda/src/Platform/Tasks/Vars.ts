import { Console } from "../../Tuval/CLI";
import { Config } from "../../Tuval/Config";
import { Action } from "../../Tuval/Platform/Action";

export class Vars extends Action {
    public static getName(): string {
        return 'vars';
    }

    constructor() {
        super();
        this.desc('List all the server environment variables')
            .callback(() => this.action());
    }

    public action(): void {
        const config = Config.getParam('variables', []);
        const vars: any[] = [];

        for (const category of config) {
            for (const variable of category.variables ?? []) {
                vars.push(variable);
            }
        }

        for (const variable of vars) {
            Console.log(`- ${variable.name}=${process.env[variable.name] || ''}`);
        }
    }
}