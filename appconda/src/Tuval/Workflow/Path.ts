import { State } from "./State";
import { WorkflowStep } from "./Step";
import { StepExecuter } from "./StepExecuter";
import { StartEvent } from "./Steps/BPMN20/Task";
import { ProcessStep } from "./Steps/ProcessStep";

export class Path {

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

    public getSteps(): WorkflowStep[] {
        return this.steps;
    }

    public addStep(key: string, step: WorkflowStep): this;
    public addStep(step: WorkflowStep): this;
    public addStep(...args: any[]): this {
        if (args.length === 1) {
            const step = args[0];
            if (step instanceof StartEvent){
                this.position = step.getId();
            }
            const key = (step as any).constructor.NAME;
            this.steps[key] = step;
        } else if (args.length === 2) {
            const key = args[0];
            const step = args[1];
            if (step instanceof StartEvent){
                this.position = step.getId();
            }
            this.steps[key] = step;
        }
        return this;
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
