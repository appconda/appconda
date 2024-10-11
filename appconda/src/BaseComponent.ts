import { BaseService } from "./BaseService";
import { Container } from "./Container";
import WebServerService from "./Services/WebServerService";

const multer = require("multer");

export abstract class BaseComponent {
    protected services: Container;
    constructor({ services }) {
        this.services = services;
    }

    public construct() {

    }

    public init() {

         const webServer: WebServerService = this.services.get('com.realmocean.service.web');

        const service: BaseService = this.services.get(this.serviceName);
        service.addComponent(this);


        const router = webServer.getRouter();
        const upload = multer();
        router.post('/' + this.serviceName + "/components/" + this.uid,upload.single("file"), async (req: any, res: any) => {

            const config = this.buildConfig();
            const params = {};

            for (let key in config) {
                const param = config[key];
                /* if (param.required === true && req.body[key] === undefined) {
                    throw new Error(key + ' is required.')
                }  */
                if (param.type === 'file') {
                    console.log('csv')
                    const file = (req as any).file;

                     const content = file.buffer.toString('utf8');
                    params[key] = content;
                } else {
                    params[key] = req.body[key] ;
                }
            }


            try {
                const result = await (this as any).build(params)
                res.json(result);
            }
            catch (e) {
                console.error(e);
                res.status(500);
                return res.json({
                    error: true,

                });
            }
        });


    }

    abstract get uid(): string;
    abstract get serviceName(): string;
    abstract get groupName(): string;
    abstract get displayName(): string;
    abstract get description(): string;
    abstract get documentation(): string;

    abstract buildConfig(): object;

}