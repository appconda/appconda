import path from 'path';
import { parseString } from 'xml2js';
import { Action } from '../../Tuval/Platform/Action';
import { Process } from '../../Tuval/Workflow/Process';
import { ProcessItem } from '../../Tuval/Workflow/ProcessItem';
import { State } from '../../Tuval/Workflow/State';
import { Workflow } from '../../Tuval/Workflow/Workflow';
import { nanoid } from '../Services/id-service/nanoid/nanoid';
import { register } from '../../app/init';
import { Group } from '../../Tuval/Pools';
import { EventBus } from '../../Tuval/EventBus/EventBus';
import { Registry } from '../../Tuval/Registry';
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
Workflow.setResource('pools', async(register: Registry) => register.get('pools'), ['register']);
Workflow.setResource('eventBus', async (pools: Group) => {
    const connection = await pools.get('pubsub').pop();
    const adapter = connection.getResource();
    return  new EventBus(adapter);
    
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
    

        const xml = parse(readFile(path.resolve(__dirname, './b.bpmn')));
 

        const woc = new Workflow(xml);
        woc.runStepByStep({});

        setInterval(() => {
            woc.next()
        }, 1000)

    }


}