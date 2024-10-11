export abstract class Adapter {
    abstract subscribe(projectId: string, identifier: any, roles: string[], channels: string[]): void;
    abstract unsubscribe(identifier: any): void;
    static send(projectId: string, payload: any[], events: any[], channels: string[], roles: string[],
        options: any[]): void {
        throw new Error('Method not implemented.');
    }
}