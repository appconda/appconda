
import { WorkflowStep } from "../../Step/WorkflowStep";
import { Workflow } from "../../Workflow";
import { After } from "../After";

export interface IAllowNextAfter {
     after(step: WorkflowStep): After;
}

export const AllowNextAfterMixin = {

     after: (step: WorkflowStep): After  => {
        (this as any).nextStage = new After( (this as any).workflow).after(step);
        return  (this as any).nextStage;
    }
}
/* 

// Utility function to apply mixin
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

import { AllowNextAfterMixin } from './AllowNextAfterMixin';
import { Workflow } from '../State/Workflow';

// Main class that uses the mixin
class MyWorkflowClass {
    private workflow: Workflow;

    constructor(workflow: Workflow) {
        this.workflow = workflow;
    }

    // Other methods and properties for MyWorkflowClass
}

// Apply the mixin
applyMixins(MyWorkflowClass, [AllowNextAfterMixin]);

// Usage
const workflow = new Workflow(); // Ensure Workflow is properly instantiated
const myWorkflow = new MyWorkflowClass(workflow);

// Now you can use the 'after' method provided by the mixin
const step = new WorkflowStep(); // Ensure WorkflowStep is properly instantiated
myWorkflow.after(step); */