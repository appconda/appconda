import { Execution, ProcessItem } from "../../ProcessItem";
import {
    unaryTest,
    evaluate
} from 'feelin';


export class SequenceFlow extends ProcessItem {

    private targetRef: string;
    private sourceRef: string;
    private expression: string;

    public getTargetRef(): string {
        return this.targetRef;
    }
    public setTargetRef(targetRef: string) {
        this.targetRef = targetRef;
    }

    public getSourceRef(): string {
        return this.sourceRef;
    }
    public setSourceRef(sourceRef: string) {
        this.sourceRef = sourceRef;
    }

    public getExpression(): string {
        return this.expression;
    }
    public setExpression(expression: string) {
        this.expression = expression;
    }

    public get target(): ProcessItem {
        return this.getProcess().getStepById(this.targetRef);
    }

    public get source(): ProcessItem {
        return this.getProcess().getStepById(this.sourceRef);
    }

    constructor() {
        super()
        this
            .desc('SequenceFlow')
            .action()
            .action(this.execute.bind(this))
    }

    private execute() {
        console.log('SequenceFlow ' + this.getId() + ' executed.')
        if (this.targetRef != null) {
            return Execution.Contionue;
        }
    }

    public hasExpression() {
        return this.getExpression() != null;
    }

    public evaluateExpression() {
       return evaluate(this.getExpression(), {
            test: 20
        });
    }

}