import * as parser from 'cron-parser';
import { DateTime, Document } from '../../Tuval/Core';
import { Console } from '../../Tuval/CLI';
import { ScheduleBase } from './ScheduleBase';
import { Group } from '../../Tuval/Pools';
import { Database } from '../../Tuval/Database';
import { Action } from '../../Tuval/Platform/Action';
import { Workflow } from '../../Tuval/Workflow/Workflow';
import { State } from '../../Tuval/Workflow/State';
import { ConsoleStep, StartEvent } from '../../Tuval/Workflow/Steps/BPMN20/Task';
import { Path } from '../../Tuval/Workflow/Path';
import { workflows } from 'googleapis/build/src/apis/workflows';
import { WorkflowStep } from '../../Tuval/Workflow/Step';
import { nanoid } from '../Services/id-service/nanoid/nanoid';



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
        const woc = new Workflow(state);
        workflows.push(woc);


        const stepMap = {};
        stepMap['start'] = StartEvent;
        stepMap['console'] = ConsoleStep;
        //section.addStep(new CounterStep(5))
        function JSONToFlow(flow: any[]): Path {
            const section = new Path();

            for (let i = 0; i < flow.length; i++) {
                const stepType = stepMap[flow[i].type];
                const step: WorkflowStep = new stepType();
                step.setId(flow[i].id);
                if (flow[i].payload) {
                    step.setPayload(flow[i].payload);
                }
                section.addStep(step);
            }

            // outgoings
            for (let i = 0; i < flow.length; i++) {
                const step = section.getStepById(flow[i].id);
                const outgouings = flow[i].outgoings;
                if (Array.isArray(outgouings)) {
                    for (let j = 0; j < outgouings.length; j++) {
                        const outgoingStep = section.getStepById(outgouings[j]);
                        step.outgoing(outgoingStep);
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
        const section = JSONToFlow(orderedToJSONFlow(orderedFlow));
        woc.runStepByStep(section);

        setInterval(()=> {
            woc.next()
        }, 1000)

    }


}