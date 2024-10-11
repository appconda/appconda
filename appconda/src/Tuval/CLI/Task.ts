import { Hook } from "../../Tuval/Core";


export class Task extends Hook {
    protected name: string = '';

    constructor(name: string) {
        super();
        this.name = name;
        (this as any).action = () => {};
    }

    public getName(): string {
        return this.name;
    }
}