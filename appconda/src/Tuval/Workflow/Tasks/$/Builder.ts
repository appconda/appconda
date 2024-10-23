


import { Task } from "./Task";
import { Validator } from "./Validator";


export class Builder {

    /**
     * Build Task object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const processItem = new Task();
        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;

        processItem
            .setId(id)
            .setName(name);

        const validator = new Validator();
        validator.isValid(processItem);

        return processItem;
    }



}