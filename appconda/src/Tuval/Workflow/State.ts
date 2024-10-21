import { Process } from "./Process";

export class State {
    public paths: Process[] = [];
    public currentPath: any = {}
    public vars: any = {};

    public pop() {
        this.currentPath = this.paths.pop();
    }
    public push(path: Process) {
        this.paths.push(path);
        this.currentPath = path;
    }
}