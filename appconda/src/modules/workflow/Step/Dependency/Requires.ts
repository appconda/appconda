import { WorkflowStepDependencyNotFulfilledException } from "../../Exception/WorkflowStepDependencyNotFulfilledException";
import { WorkflowContainer } from "../../State/WorkflowContainer";
import { StepDependencyInterface } from "./StepDependencyInterface";

export class Requires implements StepDependencyInterface {
    private key: string;
    private type?: string;

    constructor(key: string, type?: string) {
        this.key = key;
        this.type = type;
    }

    public check(container: WorkflowContainer): void {
        if (!container.has(this.key)) {
            throw new WorkflowStepDependencyNotFulfilledException(`Missing '${this.key}' in container`);
        }

        const value = container.get(this.key);

        if (this.type === undefined || (this.type.startsWith('?') && value === null)) {
            return;
        }

        const type = this.type.replace('?', '');

        if (['string', 'boolean', 'number', 'object', 'array'].includes(type)) {
            if (this.checkType(value, type)) {
                return;
            }
        } else if (type === 'iterable' && Array.isArray(value)) {
            return;
        } else if (type === 'scalar' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
            return;
        } else if (value instanceof (globalThis as any)[type]) {
            return;
        }

        throw new WorkflowStepDependencyNotFulfilledException(
            `Value for '${this.key}' has an invalid type. Expected ${this.type}, got ${typeof value}` + (value instanceof Object ? ` (${value.constructor.name})` : '')
        );
    }

    private checkType(value: any, type: string): boolean {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'boolean':
                return typeof value === 'boolean';
            case 'number':
                return typeof value === 'number';
            case 'object':
                return typeof value === 'object' && value !== null;
            case 'array':
                return Array.isArray(value);
            default:
                return false;
        }
    }
}
