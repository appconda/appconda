

import { SequenceFlow } from "./Flow";
import { Validator } from "./Validator";


export class Builder {

    /**
     * Build SequenceFlow object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const processItem = new SequenceFlow();
        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;
        const expression = bpmnItem.$['appconda:expression'];

        processItem
            .setId(id)
            .setName(name)
            .setExpression(expression);

        const validator = new Validator();
        validator.isValid(processItem);

        return processItem;
    }



}