import { ComponentsContainer } from "../../ComponentsContainer";
import { Container } from "../../Container";

const handlebars = require('handlebars');
const asyncHelpers = require('handlebars-async-helpers')
var isNumber = require('is-number');

const hb = asyncHelpers(handlebars);
hb.registerHelper('mul', async (a, b) => {
    if (!isNumber(a)) {
        throw new TypeError('expected the first argument to be a number');
    }
    if (!isNumber(b)) {
        throw new TypeError('expected the second argument to be a number');
    }
    return Number(a) * Number(b);
})

export class FlowExecuter {
    private services: Container;
    private variables: any = {};

    public constructor(services) {
        this.services = services;
    }

    private async fillVariables(schema) {
        const inputs = schema;
        for (let key in inputs) {
            if (typeof inputs[key] === 'string') {
                const _html = hb.compile(inputs[key]);

                /*   const formula = inputs[key].slice(1);
                  console.log(formula)
                  const fObj = new Formula(formula);*/
                console.log(this.variables);
                const result: any = await _html(this.variables);
                //const path = inputs[key].slice(1);
                inputs[key] = result/* objectPath.get(variables, path) */;
            } else if (typeof inputs[key] === 'object') {
                await this.fillVariables(inputs[key]);
            }
        }
    }

    public async execute(flow: any) {
        for (let key in flow.steps) {
            const componentSchema = flow.steps[key];
            await this.fillVariables(componentSchema.inputs);
            const component = this.services.componentsContainer.get(componentSchema.name);
            console.log(key, ' executing...', componentSchema.inputs);
            const result = await component.build(componentSchema.inputs);
            Object.assign(this.variables, {
                [key]: result
            })
        }
    }
}