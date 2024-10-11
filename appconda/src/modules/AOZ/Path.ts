import { State } from "./State";
import { ProcessStep } from "./Steps/ProcessStep";

export class Path {
    public state: State = null as any;
    private counter = -1;
    public steps: any = [] /* = {
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

    public addStep(step: ProcessStep, nextStepId?: string) {

        this.steps[step.stepId] = step
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
    }
}
