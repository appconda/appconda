import { EventRegistry } from "../../../Extensions/Events/EventRegistry";
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
        const eventType = EventRegistry[message];
        const processItem: any = new eventType();

        processItem
            .setId(id)
            .setName(name)
            .setMessageName(message)

        const validator = new Validator();
        validator.isValid(processItem);

        return processItem;
    }



}