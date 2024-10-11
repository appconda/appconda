import { Service } from './Compose/Service';
import yaml from 'js-yaml';

export class Compose {
    protected compose: Record<string, any> = {};

    constructor(data: string) {
        this.compose = yaml.load(data) as Record<string, any>;

        this.compose['services'] = Array.isArray(this.compose['services']) ? this.compose['services'] : {};

        for (const key in this.compose['services']) {
            this.compose['services'][key] = new Service(this.compose['services'][key]);
        }
    }

    public getServices(): Service[] {
        return Object.values(this.compose['services']);
    }

    public getService(name: string): Service {
        if (!this.compose['services'][name]) {
            throw new Error('Service not found');
        }

        return this.compose['services'][name];
    }

    public getNetworks(): string[] {
        return this.compose['networks'] ? Object.keys(this.compose['networks']) : [];
    }

    public getVolumes(): string[] {
        return this.compose['volumes'] ? Object.keys(this.compose['volumes']) : [];
    }
}