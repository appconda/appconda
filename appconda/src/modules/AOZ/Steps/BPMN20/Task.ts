import { Execution, MyFlow } from "../../MyFlow";
import { Path } from "../../Path";
import { ProcessStep } from "../ProcessStep";
const { evaluate } = require("angel-eval");

export class Task extends ProcessStep {

    run(path: Path, flow: MyFlow) {
        console.log('Task ' + this.stepId + ' executed.')
    }

}

export class StartEvent extends ProcessStep {

    async run(path: Path, flow: MyFlow) {

        await fetch('https://dummyjson.com/products')
            .then(res => res.json())
            .then(data => {
                const { products } = data;
                flow.state.vars.products = products;
            });

        console.log('Start Event executed.')
        return Execution.$continue(this.nextStep);
    }

}

export class UserTask extends ProcessStep {

    async run(path: Path, flow: MyFlow) {



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

    run(path: Path, flow: MyFlow) {
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
    run(path: Path, flow: MyFlow) {

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