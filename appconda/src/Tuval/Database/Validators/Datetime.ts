import { Validator } from "../../../Tuval/Core";



export class Datetime extends Validator {
    public static readonly PRECISION_DAYS = 'days';
    public static readonly PRECISION_HOURS = 'hours';
    public static readonly PRECISION_MINUTES = 'minutes';
    public static readonly PRECISION_SECONDS = 'seconds';
    public static readonly PRECISION_ANY = 'any';

    protected precision: string = Datetime.PRECISION_ANY;
    protected requireDateInFuture: boolean = false;
    protected offset: number = 0;

    constructor(requireDateInFuture: boolean = false, precision: string = Datetime.PRECISION_ANY, offset: number = 0) {
        super();
        if (offset < 0) {
            throw new Error('Offset must be a positive number.');
        }

        this.requireDateInFuture = requireDateInFuture;
        this.offset = offset;
        this.precision = precision;
    }

    public getDescription(): string {
        let message = 'Value must be valid date';

        if (this.offset > 0) {
            message += ` at least ${this.offset} seconds in future`;
        } else if (this.requireDateInFuture) {
            message += ' in future';
        }

        if (this.precision !== Datetime.PRECISION_ANY) {
            message += ` with ${this.precision} precision`;
        }

        message += '.';
        return message;
    }

    public isValid(value: any): boolean {
        if (!value) {
            return false;
        }

        try {
            const date = new Date(value);
            const now = new Date();

            if (this.requireDateInFuture && date <= now) {
                return false;
            }

            if (this.offset !== 0) {
                const diff = (date.getTime() - now.getTime()) / 1000;
                if (diff <= this.offset) {
                    return false;
                }
            }

            const denyConstants: string[] = [];

            switch (this.precision) {
                case Datetime.PRECISION_DAYS:
                    denyConstants.push('Hours', 'Minutes', 'Seconds', 'Milliseconds');
                    break;
                case Datetime.PRECISION_HOURS:
                    denyConstants.push('Minutes', 'Seconds', 'Milliseconds');
                    break;
                case Datetime.PRECISION_MINUTES:
                    denyConstants.push('Seconds', 'Milliseconds');
                    break;
                case Datetime.PRECISION_SECONDS:
                    denyConstants.push('Milliseconds');
                    break;
            }

            for (const constant of denyConstants) {
                if (date[`get${constant}`]() !== 0) {
                    return false;
                }
            }
        } catch (e) {
            return false;
        }

        const [year] = value.split('-');
        if (parseInt(year, 10) > 9999) {
            return false;
        }

        return true;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Validator.TYPE_STRING;
    }
}