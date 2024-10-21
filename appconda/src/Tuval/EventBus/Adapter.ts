
export interface Adapter {
    publish(event: string, data: string): Promise<void>;
    subscribe(event: string, handler: (data: string) => void): Promise<void>;
}