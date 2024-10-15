import e from "express";
import { BaseService } from "../BaseService";
import { Services } from "../Services";

const config = require('../config');

export default class RegisteryService extends BaseService {

    public get uid(): string {
        return Services.Registry;
    }

    get displayName(): string {
        return 'Registry Service'
    }

    /*  static  getInstance(args) {
      const _ = new WebServerService(args);
      _._init();
      return _.app;
    } */



    async init(): Promise<void> {

        const router = this.getRouter();
        router.get('/services', async (req: e.Request, res: e.Response) => {
            
            const projects = await this.getServices();
            res.json(projects);
        })

        router.get('/connectors', async (req: e.Request, res: e.Response) => {
          
            const projects = await this.getConnectors();
            res.json(projects);
        })

        router.get('/components', async (req: e.Request, res: e.Response) => {
         
            const components = await this.getComponents();
            res.json(components);
        })
    }

    async getServices() {
        const services: any[] = [];
        for (let key in this.services.instances_) {
            const service = this.services.instances_[key];
            services.push({
                uid: key,
                name: service.displayName,
                theme:service.theme,
                icon:service.icon,
                components: service.components.map(component => ({
                    uid: component.uid,
                    name: component.displayName,
                    description: component.description,
                    config: component.buildConfig()
                }))
            })
        }
        return services;
    }

    async getConnectors() {
        const connectors: any[] = [];
        for (let key in this.services.instances_) {
            const service = this.services.instances_[key];
            const connector = await service.getConnector();
            if (connector != null) {
                connectors.push(connector);
            }
        }

        return connectors;
    }

    async getComponents() {
        const allComponents: any[] = [];
        for (let key in this.services.instances_) {
            const service = this.services.instances_[key];
            const components = service.components.map(component => ({
                uid: component.uid,
                name: component.displayName,
                description: component.description,
                groupName: component.groupName,
                serviceName:service.displayName,
                service: {
                    theme: service.theme,
                    icon: service.icon
                },
                config: component.buildConfig()
            }));

            allComponents.push(...components);
        }

        return allComponents;

       
    }
}


