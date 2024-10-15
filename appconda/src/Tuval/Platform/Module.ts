import { Agent } from "./Agent";


export abstract class Module {
    protected services: { [key: string]: Agent[] } = {
        'all': [],
        'task': [],
        'http': [],
        'graphql': [],
        'worker': [],
    };

    /**
     * Add Service
     *
     * @param key string
     * @param service Service
     * @returns this
     */
    public addService(key: string, service: Agent): this {
        this.services['all'][key] = service;
        this.services[service.getType()][key] = service;

        return this;
    }

    /**
     * Remove Service
     *
     * @param key string
     * @returns this
     */
    public removeService(key: string): this {
        const service = this.services['all'][key];
        if (!service) {
            return this;
        }
        const type = service.getType();
        delete this.services['all'][key];
        delete this.services[type][key];

        return this;
    }

    /**
     * Get Service
     *
     * @param key string
     * @returns Service | null
     */
    public getService(key: string): Agent  {
        const service = this.services['all'][key];
        if (!service) {
            throw new Error(`Service ${key} not found`);
        }

        return service;
    }

    /**
     * Get Services
     *
     * @returns { [key: string]: Service }
     */
    public getServices():  Agent [] {
        return this.services['all'];
    }

    /**
     * Get services by type
     *
     * @param type string
     * @returns { [key: string]: Service }
     */
    public getServicesByType(type: string): Agent[] {
        return this.services[type] || [];
    }
}