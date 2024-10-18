import { Path } from "./Path";

export class State {
    public paths: Path[] = [];
    public currentPath: any = {}
    public vars: any = {};

    public pop() {
        this.currentPath = this.paths.pop();
    }
    public push(path: Path) {
        this.paths.push(path);
        this.currentPath = path;
    }
}