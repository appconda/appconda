import { State } from "./State";
import { WorkflowStep } from "./Step";
import { StepExecuter } from "./StepExecuter";
import { ExclusiveGateway } from "./Steps/BPMN20/ExclusiveGateway";
import { SequenceFlow, StartEvent, Task } from "./Steps/BPMN20/Task";
import { ProcessStep } from "./Steps/ProcessStep";

const stepMap = {};
stepMap['bpmn:startEvent'] = StartEvent;
stepMap['bpmn:task'] = Task;
stepMap['bpmn:sequenceFlow'] = SequenceFlow;
stepMap['exclusiveGateway'] = ExclusiveGateway;
stepMap['bpmn:endEvent'] = Task;

export class Process {

    public position;
    public stepExecuters: StepExecuter[] = [];
    public state: State = null as any;
    private counter = -1;
    public steps: WorkflowStep[] = [] /* = {
        'START':  () => {
            return new Promise((resolve, reject)=> {
                console.log('START EXECUTED');
                    resolve(
                        Execution.$continue('0')
                    )
             
                
            })
            
             
        },
        '0' : new WaitStep(3000,'1'),
        
        '1': async () => {
            console.log('1 EXECUTED')
            return {
                type: 'END'
            }
        }
    } */

    /* public constructor(state: State) {
        this.state = state;
    } */

    constructor(public bpmnProcess: any) {

        for (const key of Object.keys(bpmnProcess)) {
            if (key === '$') continue;

            const items = bpmnProcess[key];
            for (const item of items) {
                const stepType = stepMap[key];
                const step: WorkflowStep = new stepType();
                step.setName(item.$.name);
                step.setPath(this);
                step.setId(item.$.id);
                /*   if (steps[i].payload) {
                      step.setPayload(steps[i].payload);
                  } */
                if (step instanceof SequenceFlow) {
                    step.setTargetRef(item.$.targetRef);
                    step.setSourceRef(item.$.sourceRef);
                }


                this.addStep(step);
            }

        }

        for (const key of Object.keys(bpmnProcess)) {
            if (key === '$') continue;
            const items = bpmnProcess[key];
            for (let item of items) {
                const step = this.getStepById(item.$.id);

                const outgoings = item['bpmn:outgoing'];
                if (Array.isArray(outgoings)) {
                    for (let outgoing of outgoings) {
                        const outgoingFlow = this.getStepById(outgoing);
                        step.outgoing(outgoingFlow);
                    }
                }
            }
        }

        for (const key of Object.keys(bpmnProcess)) {
            if (key === '$') continue;
            const items = bpmnProcess[key];
            for (let item of items) {
                const step: WorkflowStep = this.getStepById(item.$.id);

                const incomings = item['bpmn:incoming'];
                if (Array.isArray(incomings)) {
                    for (let incoming of incomings) {
                        const incomingFlow = this.getStepById(incoming);
                        step.incoming(incomingFlow);
                    }
                }
            }
        }

        // outgoings
        /*  for (let i = 0; i < steps.length; i++) {
             const step = process.getStepById(steps[i].id);
             const outgouings = steps[i].outgoings;
             if (Array.isArray(outgouings)) {
                 for (let j = 0; j < outgouings.length; j++) {
                     const outgoingStep = process.getStepById(outgouings[j]);
                     step.outgoing(outgoingStep);
                 }
             }
         } */

        // incomings
        /*  for (let i = 0; i < steps.length; i++) {
             const step: WorkflowStep = process.getStepById(steps[i].id);
             const incomings = steps[i].incomings;
             if (Array.isArray(incomings)) {
                 for (let j = 0; j < incomings.length; j++) {
                     const outgoingStep = process.getStepById(incomings[j]);
                     step.incoming(outgoingStep);
                 }
             }
         } */

    }
    public getSteps(): WorkflowStep[] {
        return this.steps;
    }

    public addStep(key: string, step: WorkflowStep): this;
    public addStep(step: WorkflowStep): this;
    public addStep(...args: any[]): this {
        if (args.length === 1) {
            const step: WorkflowStep = args[0];
            if (step instanceof StartEvent) {
                this.position = step.getId();
            }
            const key = step.getId();
            this.steps[key] = step;
        } else if (args.length === 2) {
            const key = args[0];
            const step = args[1];
            if (step instanceof StartEvent) {
                this.position = step.getId();
            }
            this.steps[key] = step;
        }
        return this;
    }

    public getStepById(id: string) {
        return this.steps[id];
    }

    public getStartStep(): WorkflowStep {
        for (let key in this.steps) {
            if (this.steps[key] instanceof StartEvent) {
                return this.steps[key];
            }
        }
        return null;
    }

    /**
* Get Action
*
* @param key string
* @returns Action | null
*/
    public getAction(key: string): WorkflowStep | null {
        return this.steps[key] || null;
    }

    /**
     * Get Actions
     *
     * @returns { [key: string]: Action }
     */
    public getActions(): WorkflowStep[] {
        return this.steps;
    }

    /*   public addStep(step: ProcessStep, nextStepId?: string) {
  
          this.steps[step.stepId] = new StepExecuter(step);
          return ;
          if (this.counter === -1) {
              this.counter++;
             // step.nextStep = nextStepId ?? this.counter;
              this.steps['START'] = step
          } else {
              this.steps[step.stepId] = step
              this.counter++;
             // step.nextStep = nextStepId ?? this.counter;
  
          }
      } */
}
