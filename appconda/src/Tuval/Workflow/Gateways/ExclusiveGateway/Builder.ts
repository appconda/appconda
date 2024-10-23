

import { ExclusiveGateway } from "./Gateway";
import { Validator } from "./Validator";


export class Builder {

    /**
     * Build SequenceFlow object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const processItem = new ExclusiveGateway();
        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;
        const _default = bpmnItem.$.default;

        processItem
            .setId(id)
            .setName(name)
            .setDefault(_default);

        const validator = new Validator();
        validator.isValid(processItem);

        return processItem;
    }



}