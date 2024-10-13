

export class Response {
    private body: any;
    private headers: Record<string, string>;
    private statusCode: number;

    constructor(statusCode: number, body: any, headers: Record<string, string>) {
        this.body = body;
        this.headers = headers;
        this.statusCode = statusCode;
    }

    public getBody(): any {
        return this.body;
    }

    public getHeaders(): Record<string, string> {
        return this.headers;
    }

    public getStatusCode(): number {
        return this.statusCode;
    }

    public text(): string {
        return String(this.body);
    }

    public json(): any {
        try {
            const data = JSON.parse(this.body);
            return data;
        } catch (error) {
            throw new Error('Error decoding JSON');
        }
    }

    public blob(): string {
        let bin = "";
        for (let i = 0; i < this.body.length; i++) {
            bin += this.body.charCodeAt(i).toString(2) + " ";
        }
        return bin.trim();
    }
}