import { Console } from "../../../../CLI";
import { Execution, ProcessItem } from "../../../ProcessItem";



export class EndEvent extends ProcessItem {

    constructor() {
        super()
        this
            .desc('End event for process')
            .action()
            .inject('workflow')
            .inject('mail-service')
            .action(this.execute.bind(this))
    }

    private execute() {

        Console.success(`Process End with ${this.getName()}`)
        this.execution = Execution.End;


    }

}
