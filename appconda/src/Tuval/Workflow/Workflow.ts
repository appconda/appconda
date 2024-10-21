import { Exception } from "../Core";
import { Context } from "./Context/Context";
import { State } from "./Context/State";
import { Status } from "./Context/Status";
import { Token } from "./Context/Token";
import { IExecution } from "./IExecution";
import { Process } from "./Process";
import { ProcessItem } from "./ProcessItem";
import { StepExecuter } from "./StepExecuter";



type ResourceCallback = {
    callback: (...args: any[]) => any;
    injections: string[];
    reset: boolean;
};

export class Workflow {

    protected context?: Context;

    protected stepExecuters: Record<string, StepExecuter> = {};


    /**
   * Resources
   */
    protected resources: Record<string, any> = {
        error: null,
    };

    /**
   * Resource callbacks
   */
    protected static resourcesCallbacks: Record<string, ResourceCallback> = {};



    public state: State;

    break: boolean = false;
    next: () => Promise<void>;

    processes: Process[] = [];

    public constructor(bpmnObject: any) {
        //this.state = state;

        const bpmnDefinitions = bpmnObject['bpmn:definitions'];

        if (bpmnDefinitions == null) {
            throw new Exception(' bpmn definitions not found.')
        }

        const processes = bpmnDefinitions['bpmn:process'];

        if (processes == null || processes.length === 0) {
            throw new Exception(' bpmn process definition not found.')
        }

        for (const process of processes) {
            this.processes.push(new Process(process));
        }



        this.next = () => {
            return new Promise((resolve) => {
                resolve()
            })
        }
    }

    protected initProcess(processes: Process[]): void {
        for (const path of processes) {
            for (const [key, step] of Object.entries(path.getActions())) {
                /*   if (action.getType() === Action.TYPE_DEFAULT && !key.toLowerCase().includes(workerName.toLowerCase())) {
                      continue;
                  } */
                const stepExecuter = new StepExecuter(this, step);

                stepExecuter.setResource('workflow', () => this);

                step.setStepExecuter(stepExecuter);
            }
        }
    }

    public async run(path: Process) {

        let ret;
        // this.state.push(path);

        var quit = false;

        this.initProcess([path]);


        do {
            do {
                ret = await path.stepExecuters[path.position].run(true);
            } while (!ret);

            if (ret) {
                switch (ret.type) {
                    // End
                    case 'CONTINUE':
                        path.position = ret.label;
                        break;
                    case 'NOOP':
                        break;
                    // Quit the loop
                    case 'END':
                        quit = true;
                        this.break = true;
                        break;
                    case 'SUB_PATH_END':
                        // this.state.pop();
                        // this.state.currentPath.position = ret.label;
                        quit = true;
                        break;

                    default:
                        break;
                }
            }
            ret = null;
            /*  if (allowWaiting && (performance.now() - this.startTime >= this.timestep))
                 break; */
        }
        while (!quit && !this.break)
    }
    public runStepByStep({ path, context, data, node }: IExecution): void {


        if (path == null) {
            path = this.processes[0];
        }
        context = (this.context ?? context ?? Context.build({ data })).resume();

        if (!context.isReady()) throw new Exception('Context is not ready to consume');

        let activities: ProcessItem[] = [];
        if (node && context.tokens.length) {
            activities = [path.getStepById(node)];
        } else if (!context.tokens.length && !node) {
            activities = [...path.getStartEvents()];

        }

        if (!activities.length) throw new Error('Düğüm aktivitesi bulunamadı veya geçerli değil');


        let token: Token | undefined;
        if (context.tokens.length == 0) {
            for (const activity of activities) {
                const state = State.build(activity.getId(), { name: activity.getId(), value: {} });

                token = Token.build({ history: [state] });
                activity.token = token;
                activity.context = Context.build({ data }).resume();
                activity.context.addToken(token);
            }

        } else {

            for (const activity of activities) {
                token = context.getTokens(activity.getId())?.pop()?.resume();
                activity.token = token;
                activity.context = Context.build({ data }).resume();
                if (!token?.isReady()) throw new Error('Token, tüketmeye hazır değil');
            }


        }

        if (!token) throw new Error('Token bulunamadı');



        let ret;

        // this.state.push(path);

        let quit = false;

        this.initProcess([path]);

        context.status = Status.Running;

        const starts = [];
        for (const activity of activities) {
            const func = this.runActivityFunc(path, activity);
            starts.push(func);
        }

        this.next = async () => {
            //  do {
            if (!quit && !this.break) {
                for (const func of starts) {
                    await func();
                }
            }

        }

        this.next.bind(this);
    }

    private runActivityFunc(process: Process, activity: ProcessItem) {

        let isEnded: boolean = false;
        const lastExecution = { activity: null };
        return async () => {

            if (!isEnded) {

                await activity.stepExecuter.run(lastExecution.activity?.getId() !== activity.getId());

                switch (activity.execution) {
                    // End
                    case 'CONTINUE':
                        activity.takeOutgoing();
                        const next = activity.context.next();
                        const tokens = activity.context.getTokens(next[0].ref);
                        let foundToken;
                        if (tokens) {
                            for (let i = 0; i < tokens.length; i++) {
                                const token = tokens[i];
                                if (token.status === Status.Ready) {
                                    foundToken = token;
                                }
                            }
                        }
                        if (!foundToken) throw new Error('Çalışma aşamasında token bulunamadı');
                        const nextActivity: ProcessItem = process.getStepById(next[0].ref);
                        nextActivity.context = activity.context;
                        nextActivity.token = activity.token;
                        activity = nextActivity;
                        break;
                    case 'NOOP':
                        activity.takeOutgoing(); // For update tokens
                        break;
                    // Quit the loop
                    case 'END':
                        activity.takeOutgoing(); // For update tokens
                        isEnded = true;
                        break;
                    default:
                        break;
                }

                lastExecution.activity = activity;
            }

        }
    }


    public async getResource(name: string, fresh: boolean = false): Promise<any> {
        if (!(name in this.resources) || fresh || (Workflow.resourcesCallbacks[name] && Workflow.resourcesCallbacks[name].reset)) {
            if (!(name in Workflow.resourcesCallbacks)) {
                throw new Error(`Failed to find resource: "${name}"`);
            }

            const resourceCallback = Workflow.resourcesCallbacks[name];
            const resources = await this.getResources(resourceCallback.injections);
            this.resources[name] = await resourceCallback.callback(...resources);

            Workflow.resourcesCallbacks[name].reset = false;
        }

        return this.resources[name];
    }


    public async getResources(list: string[]): Promise<any[]> {
        return Promise.all(
            list.map(name => this.getResource(name))
        );

    }


    public static setResource(name: string, callback: (...args: any[]) => any, injections: string[] = []): void {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }

        Workflow.resourcesCallbacks[name] = { callback, injections, reset: true };
    }


}