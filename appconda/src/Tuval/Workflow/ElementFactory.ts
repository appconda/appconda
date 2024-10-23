import { Builder as EndEventBuilder } from "./Events/End/$/Builder";
import { Builder as MessageEndEventBuilder } from "./Events/End/Message/Builder";
import { Builder as StartEventBuilder } from "./Events/Start/$/Builder";
import { Builder as MessageStartEventBuilder } from "./Events/Start/Message/Builder";
import { Builder as TimerStartEventBuilder } from "./Events/Start/Timer/Builder";
import { Builder as SequenceFlowBuilder } from "./Flows/SequenceFlow/Builder";
import { Builder as ExclusiveGatewayBuilder } from "./Gateways/ExclusiveGateway/Builder";
import { Builder as TaskBuilder } from "./Tasks/$/Builder";
import { Builder as UserTaskBuilder } from "./Tasks/UserTask/Builder";


export class ElementFactory {

    private static isMessageEvent(bpmnItem: any) {
        if (bpmnItem['bpmn:messageEventDefinition'] != null) {
            return true;
        }
    }

    private static isTimerEvent(bpmnItem: any) {
        if (bpmnItem['bpmn:timerEventDefinition'] != null) {
            return true;
        }
    }

    public static build(key: string, bpmnItem: any) {
        switch (key) {
            case 'bpmn:startEvent':
                if (this.isMessageEvent(bpmnItem)) {
                    return MessageStartEventBuilder.build(bpmnItem);
                }
                if (this.isTimerEvent(bpmnItem)) {
                    return TimerStartEventBuilder.build(bpmnItem);
                }
                return StartEventBuilder.build(bpmnItem);
            case 'bpmn:task':
                return TaskBuilder.build(bpmnItem);
            case 'bpmn:sequenceFlow':
                return SequenceFlowBuilder.build(bpmnItem);
            case 'bpmn:endEvent':
                if (this.isMessageEvent(bpmnItem)) {
                    return MessageEndEventBuilder.build(bpmnItem);
                }

                return EndEventBuilder.build(bpmnItem);
            case 'bpmn:userTask':
                return UserTaskBuilder.build(bpmnItem);
            case 'bpmn:exclusiveGateway':
                return ExclusiveGatewayBuilder.build(bpmnItem);
        }
    }
}