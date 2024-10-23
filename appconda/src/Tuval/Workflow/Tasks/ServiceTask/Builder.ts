


import { ServiceTask } from "./Task";
import { Validator } from "./Validator";


export class Builder {

    /**
     * Build Task object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const processItem = new ServiceTask();
        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;
        const service = bpmnItem.$['appconda:service'];
        const action = bpmnItem.$['appconda:action'];
        const payload = JSON.parse(bpmnItem.$['appconda:payload']);

        processItem
            .setId(id)
            .setName(name)
            .setService(service)
            .setServiceAction(action)
            .setPayload(payload);

        const validator = new Validator();
        validator.isValid(processItem);

        return processItem;
    }



}