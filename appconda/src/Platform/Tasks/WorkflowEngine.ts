import * as parser from 'cron-parser';
import { DateTime, Document } from '../../Tuval/Core';
import { Console } from '../../Tuval/CLI';
import { ScheduleBase } from './ScheduleBase';
import { Group } from '../../Tuval/Pools';
import { Database } from '../../Tuval/Database';
import { Action } from '../../Tuval/Platform/Action';
import { Workflow } from '../../Tuval/Workflow/Workflow';
import { State } from '../../Tuval/Workflow/State';
import { ConsoleStep, SequenceFlow, StartEvent, Task } from '../../Tuval/Workflow/Steps/BPMN20/Task';
import { Path } from '../../Tuval/Workflow/Path';
import { workflows } from 'googleapis/build/src/apis/workflows';
import { WorkflowStep } from '../../Tuval/Workflow/Step';
import { nanoid } from '../Services/id-service/nanoid/nanoid';
import { ProcessStep } from '../../Tuval/Workflow/Steps/ProcessStep';



export class WorkflowEngine extends Action {
    public static getName(): string {
        return 'workflow';
    }

    constructor() {
        super();
        this.desc('Workflow Execution Engine')
            .callback(this.action.bind(this));
    }



    public action() {
        const workflows: Workflow[] = []

        const state = new State();
        const woc = new Workflow();
        workflows.push(woc);


        const stepMap = {};
        stepMap['startEvent'] = StartEvent;
        stepMap['task'] = Task;
        stepMap['sequenceFlow'] = SequenceFlow;
        stepMap['exclusiveGateway'] = Task;
        stepMap['endEvent'] = Task;


        //section.addStep(new CounterStep(5))
        function JSONToFlow(flow: {process: {id: string, steps:any[]}}): Path {
            const section = new Path();

            const process = flow.process;
            const steps = process.steps; 

            for (let i = 0; i < steps.length; i++) {
                const stepType = stepMap[steps[i].type];
                const step: WorkflowStep = new stepType();
                step.setPath(section);
                step.setId(steps[i].id);
                if (steps[i].payload) {
                    step.setPayload(steps[i].payload);
                }
                if (step instanceof SequenceFlow) {
                    step.setTargetRef(steps[i].targetRef);
                    step.setSourceRef(steps[i].sourceRef);
                }

                section.addStep(step);
            }

            // outgoings
            for (let i = 0; i < steps.length; i++) {
                const step = section.getStepById(steps[i].id);
                const outgouings = steps[i].outgoings;
                if (Array.isArray(outgouings)) {
                    for (let j = 0; j < outgouings.length; j++) {
                        const outgoingStep = section.getStepById(outgouings[j]);
                        step.outgoing(outgoingStep);
                    }
                }
            }

             // incomings
             for (let i = 0; i < steps.length; i++) {
                const step: WorkflowStep = section.getStepById(steps[i].id);
                const incomings = steps[i].incomings;
                if (Array.isArray(incomings)) {
                    for (let j = 0; j < incomings.length; j++) {
                        const outgoingStep = section.getStepById(incomings[j]);
                        step.incoming(outgoingStep);
                    }
                }
            }

            return section;
        }

        const flow = [
            {
                id: 'start1',
                type: 'start',
                outgoings: ['console1']
            },
            {
                id: 'console1',
                type: 'console',
                payload: {
                    text: 'test'
                }
            }
        ]

        const workflow = {
            'process': {
                id: 'process 1',
                steps: [
                    {
                        id: 'StartEvent_1y45yut',
                        type: 'startEvent',
                        name: 'hunger noticed',
                        outgoings: ['SequenceFlow_0h21x7r', 'Flow_1fkevat']
                    },
                    {
                        type: 'task',
                        id: 'Task_1hcentk',
                        incomings: ['SequenceFlow_0h21x7r'],
                        outgoings: ['SequenceFlow_0wnb4ke'],
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'SequenceFlow_0h21x7r',
                        sourceRef: 'StartEvent_1y45yut',
                        targetRef: 'Task_1hcentk'
                    },
                    {
                        type: 'exclusiveGateway',
                        id: 'ExclusiveGateway_15hu1pt',
                        name: 'desired dish?',
                        incomings: ['SequenceFlow_0wnb4ke'],
                        outgoings: ['Flow_0twy8xl', 'Flow_0ukn85c'],
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'SequenceFlow_0wnb4ke',
                        sourceRef: 'Task_1hcentk',
                        targetRef: 'ExclusiveGateway_15hu1pt'
                    },
                    {
                        type: 'task',
                        id: 'Activity_10m283f',
                        name: 'A 1',
                        incomings: ['Flow_0twy8xl'],
                        outgoings: ['Flow_16zwoy4'],
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'Flow_0twy8xl',
                        name: 'A=== 1',
                        sourceRef: 'ExclusiveGateway_15hu1pt',
                        targetRef: 'Activity_10m283f'
                    },
                    {
                        type: 'task',
                        id: 'Activity_1g3yx1s',
                        name: 'A 2',
                        incomings: ['Flow_0ukn85c'],
                        outgoings: ['Flow_0nwtwc3'],
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'Flow_0ukn85c',
                        name: ' A=== 2',
                        sourceRef: 'ExclusiveGateway_15hu1pt',
                        targetRef: 'Activity_1g3yx1s'
                    },
                    {
                        type: 'endEvent',
                        id: 'Event_0cgfduj',
                        name: ' A=== 2',
                        incomings: ['Flow_0nwtwc3', 'Flow_16zwoy4', 'Flow_0mj44yo'],
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'Flow_0nwtwc3',
                        sourceRef: 'Activity_1g3yx1s',
                        targetRef: 'Event_0cgfduj'
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'Flow_16zwoy4',
                        sourceRef: 'Activity_10m283f',
                        targetRef: 'Event_0cgfduj'
                    },
                    {
                        type: 'task',
                        id: 'Activity_0fx6yep',
                        incomings: ['Flow_1fkevat'],
                        outgoings: ['Flow_0mj44yo'],
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'Flow_16zwoy4',
                        sourceRef: 'StartEvent_1y45yut',
                        targetRef: 'Activity_0fx6yep'
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'Flow_0mj44yo',
                        sourceRef: 'Activity_0fx6yep',
                        targetRef: 'Event_0cgfduj'
                    },
                    {
                        type: 'sequenceFlow',
                        id: 'Flow_1fkevat',
                        sourceRef: 'StartEvent_1y45yut',
                        targetRef: 'Activity_0fx6yep'
                    }
                ]
            }
        }

        function orderedToJSONFlow(flow: any[]) {
            const jsonFlow = [];
            flow[0].id = nanoid();
            jsonFlow.push(
                {
                    id: 'start1',
                    type: 'start',
                    outgoings: [flow[0].id]
                },
            );

            for (let i = 0; i < flow.length; i++) {
                const flowItem = flow[i];
                const jsonFlowItem: any = {};

                jsonFlowItem.id = flowItem.id ?? nanoid();
                jsonFlowItem.type = flowItem.type;
                jsonFlowItem.payload = {
                    text: flowItem.text
                }

                jsonFlowItem.outgoings = [];
                const nextItem = flow[i + 1];
                if (nextItem) {
                    nextItem.id = nanoid();
                    jsonFlowItem.outgoings.push(nextItem.id);
                }

                jsonFlow.push(jsonFlowItem);

            }
            return jsonFlow;
        }

        const orderedFlow = [
            {
                type: 'console',
                text: 'test'
            },
            {
                type: 'console',
                text: 'test1'
            },
            {
                type: 'console',
                text: 'test2'
            },
        ]
        const section = JSONToFlow(workflow);
        woc.runStepByStep({path:section});

        setInterval(() => {
            woc.next()
        }, 1000)

    }


}