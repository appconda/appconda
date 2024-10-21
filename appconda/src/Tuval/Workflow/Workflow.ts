import { Exception } from "../Core";
import { Context } from "./Context/Context";
import { State } from "./Context/State";
import { Status } from "./Context/Status";
import { Token } from "./Context/Token";
import { IExecution } from "./IExecution";
import { Process } from "./Process";
import { ProcessItem } from "./ProcessItem";
import { StepExecuter } from "./StepExecuter";


class Return {
    public type: string = '';
    public constructor(type: string) {
        this.type = type;
    }
}

export class Continue extends Return {
    public label: string | number = '';
    public constructor(label: string | number) {
        super('CONTINUE');
        this.label = label;
    }
}
export class NoOp extends Return {
    public constructor() {
        super('NOOP');
    }
}

/* export namespace Execution {
    export function $continue(label: string | number) {
        return new Continue(label);
    }

    export function $noop() {
        return new NoOp();
    }
} */

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

        for(const process of processes) {
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
                ret = await path.stepExecuters[path.position].run();
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

        let activity: ProcessItem | undefined;
        if (node && context.tokens.length) {
            activity = path.getStepById(node);
        } else if (!context.tokens.length && !node) {
            activity = path.getStartStep();

        }

        if (!activity) throw new Error('Düğüm aktivitesi bulunamadı veya geçerli değil');


        let token: Token | undefined;
        if (context.tokens.length == 0) {
            const state = State.build(activity.getId(), { name: activity.getId(), value: {} });

            token = Token.build({ history: [state] });

            context.addToken(token);
        } else {
            token = context.getTokens(activity.getId())?.pop()?.resume();

            if (!token?.isReady()) throw new Error('Token, tüketmeye hazır değil');
        }

        if (!token) throw new Error('Token bulunamadı');

        path.position = activity.getId();

        let ret;

        // this.state.push(path);

        let quit = false;

        this.initProcess([path]);

        context.status = Status.Running;
        this.next = async () => {
            //  do {

            activity.token = token;
            activity.context = context;

            if (!quit && !this.break) {
           

                    //  if (context.status === Status.Running) {


                   await activity.stepExecuter.run();


                    //}
                    //console.log( "Block " + section.position + " - Sourcepos: " + this.sourcePos );

                
                    switch (activity.execution) {
                        // End
                        case 'CONTINUE':
                            activity.takeOutgoing();
                            const next = context.next();
                            const tokens = context.getTokens(next.ref);
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
                            activity = path.getStepById(next.ref);
                            break;
                        case 'NOOP':
                            break;
                        // Quit the loop
                        case 'END':
                            quit = true;
                            break;
                        case 'SUB_PATH_END':
                            //this.state.pop();
                            // this.state.currentPath.position = ret.label;
                            quit = true;
                            break;

                        default:
                            break;
                    }
                
               
            }
        }

        this.next.bind(this);
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