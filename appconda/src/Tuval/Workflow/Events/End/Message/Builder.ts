import { EventRegistry } from "../../../Extensions/Events/EventRegistry";
import { MessageEndEvent } from "./Event";
import { Validator } from "./Validator";



export class Builder {

    /**
     * Build MessageStartEvent object from bpmn json object
     * @param bpmnItem 
     * @returns 
     */
    public static build(bpmnItem: any) {

        const id = bpmnItem.$.id;
        const name = bpmnItem.$.name;
        const message = bpmnItem.$['appconda:message'];
        const processItem: any = new MessageEndEvent();

        processItem
            .setId(id)
            .setName(name)
            .setMessageName(message)

        const validator = new Validator();
        validator.isValid(processItem);

        return processItem;
    }



}