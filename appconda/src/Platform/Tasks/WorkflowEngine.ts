import path from 'path';
import { requestAnimationFrame } from 'request-animation-frame-polyfill';
import { parseString } from 'xml2js';
import { register } from '../../app/init';
import { EventBus } from '../../Tuval/EventBus/EventBus';
import { Action } from '../../Tuval/Platform/Action';
import { Group } from '../../Tuval/Pools';
import { Registry } from '../../Tuval/Registry';
import { Workflow } from '../../Tuval/Workflow/Workflow';

const fs = require('fs');

export const readFile = (path: string): string => fs.readFileSync(path, 'utf8');

/**
 * It takes an XML string and returns a BPMN schema
 *
 * @param {string} xml - string - the XML string to parse
 *
 * @returns A BPMNSchema object
 */
export const parse = (xml: string) => {
    xml = xml.replace(/bpmn\d?:/g, 'bpmn:');

    let parse;
    parseString(xml, { async: false }, (err, result) => {
        if (err) throw err;
        parse = result;
    });

    if (!parse) throw new Error('Input string is not parsable');

    return parse;
};


Workflow.setResource('register', async () => register);
Workflow.setResource('pools', async (register: Registry) => register.get('pools'), ['register']);

Workflow.setResource('service-platform', async (register: Registry) => {
    return register.get('service-platform');

}, ['register']);

Workflow.setResource('eventBus', async (pools: Group) => {
    const connection = await pools.get('pubsub').pop();
    const adapter = connection.getResource();
    return new EventBus(adapter);

}, ['pools']);



export class WorkflowEngine extends Action {
    public static getName(): string {
        return 'workflow';
    }

    constructor() {
        super();
        this.desc('Workflow Execution Engine')
            .callback(this.action.bind(this));
    }



    public action() {


        const xmlb = parse(readFile(path.resolve(__dirname, './b.bpmn')));
        const xmlc = parse(readFile(path.resolve(__dirname, './c.bpmn')));


        const w1 = new Workflow(xmlb);
        w1.runStepByStep({});

        const w2 = new Workflow(xmlc);
        w2.runStepByStep({});

        const worflows = [w1, w2];

        const workflowLoop = (time: number) => {
            for(const wf of worflows){
                wf.next();
            }
           
            requestAnimationFrame(workflowLoop)
          }

          // We start to main loop
        requestAnimationFrame(workflowLoop)

    }


}