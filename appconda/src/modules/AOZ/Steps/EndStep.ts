import { ProcessStep } from "./ProcessStep";

export class EndStep extends ProcessStep {
    constructor() {
        super('END', '', {})
    }
    async run() {
        return {
            type: 'END'
        }
    }

}
