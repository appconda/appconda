import { Container } from "../Container";
import { Platform } from "../Tuval/Platform/Platform";
import { Core } from "./Modules/Core";
import { ServiceCore } from "./Modules/Services";
import { ServiceActionExecuter } from "./Services/ServiceServer";


export class Appconda extends Platform {
    constructor() {
        super(new Core());
    }
}


var fs = require('fs');
var path = require('path');

type ResourceCallback = {
    callback: (...args: any[]) => any;
    injections: string[];
    reset: boolean;
};

const container = new Container(null);


export class AppcondaServicePlatform extends Platform {
    constructor() {
        super(new ServiceCore());
    }

    public async start(): Promise<any> {
        try {

            const services = require('./Services/config/services');

            for (const [key, value] of Object.entries(services)) {
                const service = value as any;
                const fromPath = path.join(__dirname, 'Services', service.service);

                const stat = fs.statSync(fromPath);

                if (stat.isFile()) {

                    const service = require(path.resolve(fromPath));
                    container.registerService(service.default);
                    //console.log(service.default);
                }

                else if (stat.isDirectory())
                    console.log(fromPath);
            }



            await container.init();




        } catch (error) {
          /*   ServiceActionExecuter.setResource("error", () => error);
            for (const hook of this.errorHooks) {
                hook.getAction()(...this.getArguments(hook));
            } */
        }
        return this;
    }

    public getServiceAction(serviceName: string, action: string): ServiceActionExecuter {
        return this.serviceActionExecuters[`${serviceName}-${action}`];
    }
}

