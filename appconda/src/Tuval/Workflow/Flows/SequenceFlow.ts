import { Execution, ProcessItem } from "../ProcessItem";


export class SequenceFlow extends ProcessItem {

    private targetRef: string;
    private sourceRef: string;

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

    public static build(bpmnItem: any) {
        const processItem = new SequenceFlow();
        const id = ProcessItem.buildId(bpmnItem);
        const name = ProcessItem.buildName(bpmnItem);
        const metadata = ProcessItem.buildMetadata(bpmnItem);

        processItem
            .setId(id)
            .setName(name)

            return processItem;
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