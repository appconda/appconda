import { Path } from "./Path";
import { State } from "./State";
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






export class MyFlow {
    public state: State;

    break: boolean = false;
    next: () => Promise<void>;

    public constructor(state: State) {
        this.state = state;
        this.next = () => {
            return new Promise((resolve) => {
                resolve()
            })
        }
    }

    private initPath(path: Path, ret?) {
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

        path.state = this.state;

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
            path.addStep(new EndStep());
        }
        return path;
    }
    public async run(path: any) {

        let ret;
        this.state.push(path);

        var quit = false;

        if (!path.initialized)
            path = this.initPath(path);

        if (typeof path.startStep != 'undefined') {
            path.position = path.startStep;
            path.startBlock = undefined;
        }

        do {
            do {
                //console.log( "Block " + section.position + " - Sourcepos: " + this.sourcePos );
                if (path.steps[path.position] instanceof ProcessStep) {
                    ret = await path.steps[path.position].run(path.self, this, path.vars);
                } else {
                    ret = await path.steps[path.position].call(path.self, this, path.vars);
                }
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
                        this.state.pop();
                        this.state.currentPath.position = ret.label;
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
        while (this.state.currentPath && !quit && !this.break)
    }

    public runStepByStep(path: any): void {

        let ret;
        this.state.push(path);

        var quit = false;

        if (!path.initialized)
            path = this.initPath(path);

        if (typeof path.startStep != 'undefined') {
            path.position = path.startStep;
            path.startBlock = undefined;
        }

        this.next = async () => {
            //  do {
            if (this.state.currentPath && !quit && !this.break) {
                do {
                    //console.log( "Block " + section.position + " - Sourcepos: " + this.sourcePos );
                    if (path.steps[path.position] instanceof ProcessStep) {
                        ret = await path.steps[path.position].run(path.self, this, path.vars);
                    } else {
                        ret = await path.steps[path.position].call(path.self, this, path.vars);
                    }
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
                            break;
                        case 'SUB_PATH_END':
                            this.state.pop();
                            this.state.currentPath.position = ret.label;
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

        //this.next();
    }
}