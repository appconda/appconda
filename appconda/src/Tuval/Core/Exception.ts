export class Exception extends Error {
    constructor(message: string, code: number | string = 0, previous: Error | null = null) {
        if (typeof code === 'string') {
            if (!isNaN(Number(code))) {
                code = parseInt(code, 10);
            } else {
                code = 0;
            }
        }

        super(message);
        this.name = 'DatabaseException';
        this.code = code;
        if (previous) {
            this.stack = previous.stack;
        }
    }

    public code: number;

    public  getCode(): number {
        if (typeof this.code === 'string') {
            if (!isNaN(Number(this.code))) {
                this.code = parseInt(this.code, 10);
            } else {
                this.code = 0;
            }
        }
        return this.code;
    }
}