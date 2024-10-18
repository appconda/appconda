
import { Path } from "../../../Tuval/Workflow/Path";
import { State } from "../../../Tuval/Workflow/State";
import { StartEvent, ServiceTask, UserTask, ExculusiveGateway } from "../../../Tuval/Workflow/Steps/BPMN20/Task";
import { ProcessStep } from "../../../Tuval/Workflow/Steps/ProcessStep";
import { Execution, Workflow } from "../../../Tuval/Workflow/Workflow";
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
    async run(path: Path, flow: Workflow) {
        console.log(this.logMessage);
        return Execution.$continue(this.nextStep);
    }
}
const state = new State();

const workflows: Workflow[] = []



    const woc = new Workflow(state);
    workflows.push(woc);

    const section = new Path();

    //section.addStep(new CounterStep(5))
    section.addStep(new StartEvent())
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