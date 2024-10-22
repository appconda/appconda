import TaskApplet from "../../../../Platform/Applets/task-applet/TaskApplet";
import { Execution, ProcessItem } from "../../ProcessItem";

export class UserTask extends ProcessItem {

    private userId: string;
    public getUserId(): string {
        return this.userId;
    }

    
    constructor() {
        super()
        this
            .desc(`
                - User Tasks are tasks that users perform manually. 
                - For example, tasks such as approving customer orders or filling out forms can be modeled as user tasks. 
                - They are generally used for processes that require human interaction.
                `)
                .init()
                .inject('task-applet')
                .action( (taskApplet: TaskApplet) => {

                    console.log(taskApplet)

                    taskApplet.create({
                        name:'sdf',
                        projectId: 'sdfsd',
                        appletId:'sdf'
                    });
                })

            this.action()
            .inject('task-applet')
            .action(this.execute.bind(this))
    }

    private execute(taskApplet: TaskApplet) {
        console.log('Kullanicidan onay bekliyor.')

        taskApplet.getTaskStatus({
            appletId: 'asdfa',
            projectId: 'sde',
            taskId:'sad'
        })  
        
        this.execution = Execution.NOOP;
    }

    public static build(bpmnItem: any) {
        const processItem = new UserTask();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
       // const metadata = ProcessItem.buildMetadata(bpmnItem);
        const userId = bpmnItem.$['appconda:userId'];
        processItem
            .setId(id)
            .setName(name)

            return processItem;
    }
}