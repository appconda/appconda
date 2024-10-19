import { Exception } from "../Core";
import { Context } from "./Context/Context";
import { State } from "./Context/State";
import { Status } from "./Context/Status";
import { Token } from "./Context/Token";
import { IExecution } from "./IExecution";
import { Path } from "./Path";
import { WorkflowStep } from "./Step";
import { StepExecuter } from "./StepExecuter";
import { EndStep } from "./Steps/EndStep";
import { ProcessStep } from "./Steps/ProcessStep";


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

export namespace Execution {
    export function $continue(label: string | number) {
        return new Continue(label);
    }

    export function $noop() {
        return new NoOp();
    }
}

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

    public constructor() {
        //this.state = state;
        this.next = () => {
            return new Promise((resolve) => {
                resolve()
            })
        }
    }

    private _initPath(path: Path, ret?) {
        if (ret) {
            (path as any).currentResult = ret.result;
        }
        if (!(path as any).self)
            (path as any).self = path;
        (path as any).results = [];
        (path as any).returns = [];
        (path as any).onError = false;
        (path as any).isErrorProc = false;
        (path as any).lastError = 0;
        (path as any).lastErrorMessage = '';
        (path as any).position = 'START';
        (path as any).initialized = true;
        (path as any).nextError = null;
        (path as any).trappedErrorNumber = 0;
        (path as any).objects = {};

        //path.state = this.state;

        // Find a sub-object
        (path as any).getObject = function (index) {
            var thisArray = this.parent[this.className];
            if (!thisArray)
                thisArray = this.parent[this.objectName];
            if (!thisArray)
                throw 'object_not_found';
            if (!thisArray[index])
                throw 'object_not_found';
            return thisArray[index];
        };

        if (path.steps['END'] === undefined) {
            // path.addStep(new EndStep());
        }
        return path;
    }
    public async run(path: Path) {

        let ret;
        // this.state.push(path);

        var quit = false;

        this.initPath([path]);


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

        context = (this.context ?? context ?? Context.build({ data })).resume();

        if (!context.isReady()) throw new Exception('Context is not ready to consume');

        let activity: WorkflowStep | undefined;
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

        this.initPath([path]);

        context.status = Status.Running;
        this.next = async () => {
            //  do {

            activity.token = token;
            activity.context = context;

            if (!quit && !this.break) {
                do {

                    //  if (context.status === Status.Running) {


                    ret = await path.stepExecuters[activity.getId()].run();


                    //}
                    //console.log( "Block " + section.position + " - Sourcepos: " + this.sourcePos );

                } while (!ret);

                activity.takeOutgoing();

                const next = context.next();

                token = context.getTokens(next.ref)?.find((t) => t.status === Status.Ready);

                if (!token) throw new Error('Çalışma aşamasında token bulunamadı');

                activity = path.getStepById(next.ref);


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
                ret = null;
                /*  if (allowWaiting && (performance.now() - this.startTime >= this.timestep))
                     break; */
            }
        }

        this.next.bind(this);
    }

    /**
    * If a resource has been created, return it; otherwise, create it and then return it
    * @param name - The name of the resource
    * @param fresh - Whether to fetch a fresh instance
    * @returns The requested resource
    * @throws Error if the resource callback is not found
    */
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

    /**
   * Get multiple resources by their names
   * @param list - List of resource names
   * @returns An array of resources
   */
    public async getResources(list: string[]): Promise<any[]> {
        return Promise.all(
            list.map(name => this.getResource(name))
        );

    }

    /**
    * Set a new resource callback
    * @param name - The name of the resource
    * @param callback - The callback function to create the resource
    * @param injections - Dependencies to inject into the callback
    * @throws Error if inputs are invalid
    */
    public static setResource(name: string, callback: (...args: any[]) => any, injections: string[] = []): void {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }

        Workflow.resourcesCallbacks[name] = { callback, injections, reset: true };
    }

    protected initPath(paths: Path[]): void {
        for (const path of paths) {
            for (const [key, step] of Object.entries(path.getActions())) {
                /*   if (action.getType() === Action.TYPE_DEFAULT && !key.toLowerCase().includes(workerName.toLowerCase())) {
                      continue;
                  } */
                const stepExecuter = new StepExecuter(this, step);

                stepExecuter.setResource('workflow', () => this);

                path.stepExecuters[step.getId()] = stepExecuter;
                let hook;

                switch (step.getType()) {
                    case WorkflowStep.TYPE_INIT:
                        hook = stepExecuter.init();
                        break;
                    case WorkflowStep.TYPE_ERROR:
                        hook = stepExecuter.error();
                        break;
                    case WorkflowStep.TYPE_SHUTDOWN:
                        hook = stepExecuter.shutdown();
                        break;
                    case WorkflowStep.TYPE_WORKER_START:
                        hook = stepExecuter.workerStart();
                        break;
                    case WorkflowStep.TYPE_DEFAULT:
                    default:
                        hook = stepExecuter.job();
                        break;
                }
                hook.groups(step.getGroups()).desc(step.getDesc() ?? '');

                for (const [key, option] of Object.entries(step.getOptions())) {
                    switch (option.type) {
                        case 'param':
                            const paramKey = key.substring(key.indexOf(':') + 1);
                            hook.param(paramKey, option.default, option.validator, option.description, option.optional, option.injections);
                            break;
                        case 'injection':
                            hook.inject(option.name);
                            break;
                    }
                }

                for (const [key, label] of Object.entries(step.getLabels())) {
                    hook.label(key, label);
                }

                hook.action(step.getCallback());
            }
        }
    }
}