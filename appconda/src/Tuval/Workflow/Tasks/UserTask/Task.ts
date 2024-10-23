import TaskApplet from "../../../../Platform/Applets/task-applet/TaskApplet";
import { ProcessItem, Execution } from "../../ProcessItem";


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

 
}