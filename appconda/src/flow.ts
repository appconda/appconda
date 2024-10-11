
import { Execution, MyFlow, } from "./modules/AOZ/MyFlow";
import { Path } from "./modules/AOZ/Path";
import { State } from "./modules/AOZ/State";
import { ExculusiveGateway, StartEvent, UserTask } from "./modules/AOZ/Steps/BPMN20/Task";
import { EndStep } from "./modules/AOZ/Steps/EndStep";
import { ProcessStep } from "./modules/AOZ/Steps/ProcessStep";
import { WOC } from "./modules/AOZ/WorkflowCircle";

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
    async run(path: Path, flow: MyFlow) {
        console.log(this.logMessage);
        return Execution.$continue(this.nextStep);
    }
}
const state = new State();

const workflows: MyFlow[] = []
for (let i = 5; i < 3; i++) {
    const woc = new MyFlow(state);
    // workflows.push(woc);

    const section = new Path();

    //section.addStep(new CounterStep(5))
    section.addStep(new LogStep('START', '3', 'First Log'))
    //section.addStep(new WaitStep(3000))
    section.addStep(new LogStep('2', 'END', 'SecondLog'))
    //section.addStep(new WaitStep(3000))
    section.addStep(new LogStep('3', '2', 'Last Log',))

    woc.runStepByStep(section);
}


    const woc = new MyFlow(state);
    workflows.push(woc);

    const section = new Path();

    //section.addStep(new CounterStep(5))
    section.addStep(new StartEvent('START', 'arac_getirildi'))
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
    }))


    woc.runStepByStep(section);



/* setInterval(() => {
    for (let i = 0; i < workflows.length; i++) {
        if (!workflows[i].break) {
            workflows[i].next();
        }
    }

}, 1000) */


 setInterval(() => {
    woc.next();
}, 1000) 