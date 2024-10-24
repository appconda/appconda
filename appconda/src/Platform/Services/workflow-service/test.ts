
import { Process } from "../../../Tuval/Workflow/Process";
import { State } from "../../../Tuval/Workflow/State";
import { ProcessItem } from "../../../Tuval/Workflow/ProcessItem";
import { StartEvent, ServiceTask, UserTask, ExculusiveGateway, ConsoleStep } from "../../../Tuval/Workflow/Steps/BPMN/Task";
import { ProcessStep } from "../../../Tuval/Workflow/Steps/ProcessStep";
import { Execution, Workflow } from "../../../Tuval/Workflow/Workflow";
import { nanoid } from "../id-service/nanoid/nanoid";
import { SendEmail } from "../mail-service/Actions/SendEmail";
import MailService from "../mail-service/MailService";



//


function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}


class WaitStep extends ProcessStep {
    delay: number = 1000;

    constructor(delay: number, nextStep?: string) {
        super('', '', {});
        this.delay = delay;
        if (nextStep !== undefined) {
            this.nextStep = nextStep;
        }

    }
    async run() {
        await delay(3000);
        return Execution.$continue(this.nextStep);
    }
}

class CounterStep extends ProcessStep {
    counter: number = 0;
    count: number = 0;

    constructor(stepId: string, count: number) {
        super(stepId, stepId, {});
        this.count = count;


    }
    async run() {
        this.counter++;
        if (this.count === this.counter) {
            console.log(this.counter);
            return Execution.$continue(this.nextStep);
        } else {
            return Execution.$noop();
        }
    }
}

class LogStep extends ProcessStep {
    logMessage: string;

    public constructor(stepId: string, nextStepId: string, logMessage: string) {
        super(stepId, nextStepId, {});
        this.logMessage = logMessage;
    }
    async run(path: Process, flow: Workflow) {
        console.log(this.logMessage);
        return Execution.$continue(this.nextStep);
    }
}
const state = new State();

const workflows: Workflow[] = []



const woc = new Workflow(state);
workflows.push(woc);


const stepMap = {};
stepMap['start'] = StartEvent;
stepMap['console'] = ConsoleStep;
//section.addStep(new CounterStep(5))
function JSONToFlow(flow: any[]): Process {
    const section = new Process();

    for (let i = 0; i < flow.length; i++) {
        const stepType = stepMap[flow[i].type];
        const step: ProcessItem = new stepType();
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

/*   section.addStep(new ServiceTask('service', 'arac_getirildi', {
      SERVICE: MailService, 
      ACTION: SendEmail
  }))
  section.addStep(new UserTask('arac_getirildi', 'arac_yikama', {
      name: 'Arac Getirildi'
  }))
  section.addStep(new UserTask('arac_yikama', 'arac_temiz_mi', {
      name: 'Arac Yikama'
  }))

  section.addStep(
      (new ExculusiveGateway('arac_temiz_mi', '', {
      name: 'Arac Temiz mi?'
  }))
  .addExpression('ARAC_TEMIZ_MI === true', 'arac_teslim')
  .addExpression('ARAC_TEMIZ_MI !== false', 'personele_kiz')

)

section.addStep(new UserTask('personele_kiz', 'arac_yikama', {
  name: 'Personele Kiz'
}))

  section.addStep(new UserTask('arac_teslim', 'END', {
      name: 'Arac Teslim'
  })) */

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
woc.run(section);

/* setInterval(() => {
    for (let i = 0; i < workflows.length; i++) {
        if (!workflows[i].break) {
            workflows[i].next();
        }
    }

}, 1000) */


/*  setInterval(() => {
    woc.next();
}, 1000)  */