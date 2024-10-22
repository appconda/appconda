import { Execution, ProcessItem } from "../../ProcessItem";

export class UserTask extends ProcessItem {

    constructor() {
        super()
        this
            .desc(`
                - User Tasks are tasks that users perform manually. 
                - For example, tasks such as approving customer orders or filling out forms can be modeled as user tasks. 
                - They are generally used for processes that require human interaction.
                `)
            .action()
            .action(this.execute.bind(this))
    }

    private execute() {
        console.log('Waiting for user response')
        
        this.execution = Execution.NOOP;
    }

    public static build(bpmnItem: any) {
        const processItem = new UserTask();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata = ProcessItem.buildMetadata(bpmnItem);

        processItem
            .setId(id)
            .setName(name)

            return processItem;
    }
}