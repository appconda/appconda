export type Result = {
    recipient: string;
    status: string;
    error: string;
};

export class Response {
    private deliveredTo: number;
    private type: string;
    private results: Result[];

    constructor(type: string) {
        this.type = type;
        this.deliveredTo = 0;
        this.results = [];
    }

    setDeliveredTo(deliveredTo: number): void {
        this.deliveredTo = deliveredTo;
    }

    incrementDeliveredTo(): void {
        this.deliveredTo++;
    }

    getDeliveredTo(): number {
        return this.deliveredTo;
    }

    setType(type: string): void {
        this.type = type;
    }

    getType(): string {
        return this.type;
    }

    getDetails(): Result[] {
        return this.results;
    }

    addResult(recipient: string, error: string = ''): void {
        this.results.push({
            recipient: recipient,
            status: error ? 'failure' : 'success',
            error: error,
        });
    }

    toArray(): { deliveredTo: number; type: string; results: Result[] } {
        return {
            deliveredTo: this.deliveredTo,
            type: this.type,
            results: this.results,
        };
    }
}