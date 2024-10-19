import { Execution, Workflow } from "../../Workflow";
import { Path } from "../../Path";
import { ProcessStep } from "../ProcessStep";
import { WorkflowStep } from "../../Step";
import { Text } from "../../../Core";
import MailService from "../../../../Platform/Services/mail-service/MailService";
const { evaluate } = require("angel-eval");


export class Task extends WorkflowStep {

    constructor() {
        super()
        this
            .desc('Start event for workflow')
            .callback(this.action.bind(this))
    }

    private action() {
        console.log('Task ' + this.getId() + ' executed.')
        if (this.outgoings.length > 0) {
            return Execution.$continue(this.outgoings[0].getId());
        }

    }

    /*  async run(path: Path, flow: Workflow) {
 
         await fetch('https://dummyjson.com/products')
             .then(res => res.json())
             .then(data => {
                 const { products } = data;
                 flow.state.vars.products = products;
             });
 
         console.log('Start Event executed.')
         return Execution.$continue(this.nextStep);
     } */

}


export class StartEvent extends WorkflowStep {

    constructor() {
        super()
        this
            .desc('Start event for workflow')
            .inject('workflow')
            .inject('mail-service')
            .callback(this.action.bind(this))
    }

    private action(workflow: Workflow, mailService: MailService) {
        mailService.send({
            smtp: 'sdf'
        });
        
        console.log(workflow);
        console.log('Start event executed.')
        if (this.outgoings.length > 0) {
            return Execution.$continue(this.outgoings[0].getId());
        }

    }

    /*  async run(path: Path, flow: Workflow) {
 
         await fetch('https://dummyjson.com/products')
             .then(res => res.json())
             .then(data => {
                 const { products } = data;
                 flow.state.vars.products = products;
             });
 
         console.log('Start Event executed.')
         return Execution.$continue(this.nextStep);
     } */

}

export class SequenceFlow extends WorkflowStep {

    private targetRef: string;
    private sourceRef: string;

    public getTargetRef(): string {
        return this.targetRef;
    }
    public setTargetRef(targetRef:string) {
         this.targetRef = targetRef;
    }

    public getSourceRef(): string {
        return this.sourceRef;
    }
    public setSourceRef(sourceRef:string) {
         this.sourceRef = sourceRef;
    }

    constructor() {
        super()
        this
            .desc('SequenceFlow')
            .callback(this.action.bind(this))
    }

    private action() {
        console.log('SequenceFlow ' + this.getId() + ' executed.')
        if (this.targetRef != null) {
            return Execution.$continue(this.targetRef);
        }
    }

    /*  async run(path: Path, flow: Workflow) {
 
         await fetch('https://dummyjson.com/products')
             .then(res => res.json())
             .then(data => {
                 const { products } = data;
                 flow.state.vars.products = products;
             });
 
         console.log('Start Event executed.')
         return Execution.$continue(this.nextStep);
     } */

}

export class ConsoleStep extends WorkflowStep {

    constructor() {
        super()
        this
            .desc('write console text')
            .param('text', '', new Text(255))
            .callback(this.action.bind(this))
    }

    private action(text: string) {
        console.log(text)
        return this.next();
      

    }

    /*  async run(path: Path, flow: Workflow) {
 
         await fetch('https://dummyjson.com/products')
             .then(res => res.json())
             .then(data => {
                 const { products } = data;
                 flow.state.vars.products = products;
             });
 
         console.log('Start Event executed.')
         return Execution.$continue(this.nextStep);
     } */

}

export class UserTask extends ProcessStep {

    async run(path: Path, flow: Workflow) {
        console.log('User Task ' + this.stepId + ' executed.');
        const { YIKAMA_SAYI = 0, ARAC_TEMIZ_MI = false } = flow.state.vars;
        if (flow.state.vars.YIKAMA_SAYI > 3) {
            flow.state.vars.ARAC_TEMIZ_MI = true;
        } else {
            flow.state.vars.YIKAMA_SAYI = YIKAMA_SAYI + 1;
        }
        return Execution.$continue(this.nextStep);
    }

}

export class ServiceTask extends ProcessStep {

    run(path: Path, flow: Workflow) {
        console.log(this.params.SERVICE.NAME);
        console.log(this.params.ACTION.NAME);
        console.log('Service Task ' + this.stepId + ' executed.')
    }

}

export class ExculusiveGateway extends ProcessStep {
    private expressions: any[] = [];
    addExpression(expression, stepId) {
        this.expressions.push({
            expression,
            stepId
        })
        return this;
    }
    run(path: Path, flow: Workflow) {

        console.log(this.stepId)

        for (let i = 0; i < this.expressions.length; i++) {
            const { expression, stepId } = this.expressions[i];
            if (evaluate(expression, flow.state.vars)) {
                return Execution.$continue(stepId);
            }
        }
        // console.log('Service Task ' + this.stepId + ' executed.')
    }

}