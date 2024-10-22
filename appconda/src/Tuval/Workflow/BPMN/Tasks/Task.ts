import { Text } from "../../../Core";
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
        console.log('Task ' + this.getName() + ' executed.')
        if (this.outgoings.length > 0) {
            return Execution.NOOP;
        }

    }

    public static build(bpmnItem: any) {
        const processItem = new Task();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata = ProcessItem.buildMetadata(bpmnItem);

        processItem
            .setId(id)
            .setName(name)

            return processItem;
    }

   
}