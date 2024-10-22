import TaskApplet from "../../../Platform/Applets/task-applet/TaskApplet";
import { Exception, Text } from "../../Core";
import { Execution, ProcessItem } from "../ProcessItem";

export class UserTask extends ProcessItem {

    private userId: string;
    public getUserId(): string {
        return this.userId;
    }

    public setUserId(value: string) {
        this.userId = value;
    }

    constructor() {
        super();

        this
            .desc(`
                - User Tasks are tasks that users perform manually. 
                - For example, tasks such as approving customer orders or filling out forms can be modeled as user tasks. 
                - They are generally used for processes that require human interaction.
                `)

        // Init hook setup
        this.init()
            .inject('task-applet')
            .action(this.initAction.bind(this))

        // Action hook setup
        this.action()
            .inject('task-applet')
            .action(this.executeAction.bind(this))
    }

    private initAction(taskApplet: TaskApplet) {
        console.log(taskApplet)

        taskApplet.create({
            name: 'sdf',
            projectId: 'sdfsd',
            appletId: 'sdf'
        });
    }

    private executeAction(taskApplet: TaskApplet) {
        console.log('Kullanicidan onay bekliyor.')

        taskApplet.getTaskStatus({
            appletId: 'asdfa',
            projectId: 'sde',
            taskId: 'sad'
        })

        this.execution = Execution.NOOP;
    }

    /**
     * Build the item from bpmn json
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {
        const processItem = new UserTask();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        // const metadata = ProcessItem.buildMetadata(bpmnItem);
        const userId = bpmnItem.$['appconda:userId'];
        processItem
            .setId(id)
            .setName(name)
            .setUserId(userId);

        processItem.validateMetadata();

        return processItem;
    }

    /**
     * Validate item metadata
     */
    public validateMetadata(): void {
        const textValidator: Text = new Text(255);
        if (!textValidator.isValid(this.userId)) {
            // Console.error(`messageName not found for ${this.getName()}`);
            throw new Exception(`User Id not found for ${this.getName()}`)
        }
    }
}