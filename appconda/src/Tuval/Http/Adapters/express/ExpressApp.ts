import { App } from "../../App";
import { Request } from "./ExpressRequest";
import { Response } from "./ExpressResponse";

const express = require('express')


export class ExpressApp extends App {
    public static start(port: number, host: string) {
        const exp = express();
        exp.use((req, res, next) => {
            const tuvalReq = new Request(req);
            const tuvalRes = new Response(res);
            App.setResource('request', () => tuvalReq); // Wrap Request in a function
            App.setResource('response', () => tuvalRes);
            const app = new App('UTC');

            app.run(tuvalReq, tuvalRes);
            next()
        })

        App
            .init()
            .inject('appconda')
            .inject('request')
            .action(async (app: App, request: Request) => {
                Request.setRoute(app.getRoute());
            })



        exp.listen(port, host);
    }

    public static loadModules(modulesPath: string = './Modules') {

        var fs = require('fs');
        var path = require('path');

        var coreServices = modulesPath;

        const filenames = fs.readdirSync(coreServices);
        filenames.forEach(function (file: any, index: number) {
            // Make one pass and make the file complete
            var fromPath = path.join(coreServices, file);

            const stat = fs.statSync(fromPath);

            if (stat.isFile()) {
                console.log(path.resolve(fromPath))
                try {
                    const service = require(path.resolve(fromPath));
                } catch (e) {
                    console.log(e)
                }
            }

            else if (stat.isDirectory())
                console.log(fromPath);
        });
    }
}