import { Execution, ProcessItem } from "../../ProcessItem";



export class Task extends ProcessItem {

    constructor() {
        super()
        this
            .desc('Task event for workflow')
            .action()
            .action(this.execute.bind(this))
    }

    private execute() {
        console.log(this.getName() + ' executed.')
        if (this.outgoings.length > 0) {
            return Execution.NOOP;
        }

    }

   
}