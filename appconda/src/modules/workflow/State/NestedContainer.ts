import { WorkflowContainer } from "./WorkflowContainer";


export class NestedContainer extends WorkflowContainer {
    private parentContainer: WorkflowContainer;
    private container: WorkflowContainer | null;

    constructor(parentContainer: WorkflowContainer, container: WorkflowContainer | null) {
        super();
        this.parentContainer = parentContainer;
        this.container = container;
    }

    public get(key: string): any {
        if (!this.container) {
            return this.parentContainer.get(key);
        }

        return this.container.get(key) ?? this.parentContainer.get(key);
    }

    public set(key: string, value: any): WorkflowContainer {
        if (this.container) {
            this.container.set(key, value);
        }

        this.parentContainer.set(key, value);

        return this;
    }


    // Proxy method to handle dynamic method calls
    public callMethod(name: string, ...args: any[]): any {
        if (this.container && typeof (this.container as any)[name] === 'function') {
            return (this.container as any)[name](...args);
        }

        // Calls the method on the parentContainer if it exists
        if (typeof (this.parentContainer as any)[name] === 'function') {
            return (this.parentContainer as any)[name](...args);
        }

        // If method does not exist, throw an error
        throw new Error(`Method ${name} does not exist in either container.`);
    }
}
