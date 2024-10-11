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
}