
import { UserTask } from "./Task";
import { Validator } from "./Validator";


export class Builder {

    /**
     * Build MessageStartEvent object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const processItem = new UserTask();
        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;

        const userId = bpmnItem.$['appconda:userId'];
        processItem
            .setId(id)
            .setName(name)
            .setUserId(userId);

        const validator = new Validator();
        validator.isValid(processItem);

        return processItem;
    }



}