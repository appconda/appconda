import { EventRegistry } from "../../../Extensions/Events/EventRegistry";
import { EndEvent } from "./Event";
import { Validator } from "./Validator";


export class Builder {

    /**
     * Build MessageStartEvent object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const processItem = new EndEvent();
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