import { Env } from '../Env';

export class Service {
    protected service: Record<string, any> = {};

    constructor(service: Record<string, any>) {
        this.service = service;

        const ports = Array.isArray(this.service['ports']) ? this.service['ports'] : [];
        this.service['ports'] = {};

        ports.forEach((value: string) => {
            const [hostPort, containerPort] = value.split(':');
            this.service['ports'][hostPort.trim()] = containerPort?.trim() ?? '';
        });

        const environment = Array.isArray(this.service['environment']) ? this.service['environment'] : [];
        this.service['environment'] = new Env(environment.join('\n'));
    }

    public getContainerName(): string {
        return this.service['container_name'] ?? '';
    }

    public getImage(): string {
        return this.service['image'] ?? '';
    }

    public getImageVersion(): string {
        const image = this.getImage();
        return image.substring(image.indexOf(':') + 1);
    }

    public getEnvironment(): Env {
        return this.service['environment'];
    }

    public getPorts(): Record<string, string> {
        return this.service['ports'];
    }
}