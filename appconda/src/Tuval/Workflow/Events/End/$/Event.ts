import { Console } from "../../../../CLI";
import { State } from "../../../Context/State";
import { Status } from "../../../Context/Status";
import { Execution, GoOutInterface, ProcessItem } from "../../../ProcessItem";



export class EndEvent extends ProcessItem {

    constructor() {
        super()
        this
            .desc('End event for process')
            .action()
            .inject('workflow')
            .inject('mail-service')
            // We use implicit execute action for inheritance
            .action(() => {
                Console.success(`Process End with ${this.getName()}`)
                this.execution = Execution.End;
            })
    }

    protected goOut(outgoing: GoOutInterface[]) {

        this.token.status = Status.Completed;

        this.token.push(
            State.build(this.getId(), {
                name: this.getName(),
                status: Status.Completed,
                step: this!
            }),
        );


    }

}
