import { Validator } from '../Validator';

/**
 * Multiple
 *
 * Multiple validator is a container of multiple validations each acting as a rule.
 *
 * @package Validators
 */
export class Multiple extends Validator {
    protected rules: Validator[] = [];
    

    public static readonly TYPE_MIXED: string = 'mixed';
    public static readonly TYPE_STRING: string = 'string';
    public static readonly TYPE_INTEGER: string = 'integer';

    protected type: string = Multiple.TYPE_MIXED;
    
    // Add other types as needed

    /**
     * Constructor
     *
     * Multiple constructor can receive any number of arguments containing Validator instances.
     *
     * Example:
     *
     * const multiple = new Multiple([validator1, validator2]);
     * const multiple = new Multiple([validator1, validator2, validator3], Multiple.TYPE_STRING);
     *
     * @param rules Array of Validator instances
     * @param type The type of the validator (optional)
     */
    constructor(rules: Validator[], type: string = Multiple.TYPE_MIXED) {
        super();
        rules.forEach(rule => this.addRule(rule));
        this.type = type;
    }

    /**
     * Add rule
     *
     * Add a new rule to the end of the rules array.
     *
     * @param rule Validator instance to add
     * @returns this
     */
    addRule(rule: Validator): this {
        this.rules.push(rule);
        return this;
    }

    /**
     * Get Description
     *
     * Returns validator descriptions concatenated.
     *
     * @returns string
     */
    getDescription(): string {
        let description = '';
        this.rules.forEach((rule, index) => {
            description += `${index + 1}. ${rule.getDescription()} \n`;
        });
        return description.trim();
    }

    /**
     * Is valid
     *
     * Validation will pass when all rules are valid. If any rule is invalid, validation will fail.
     *
     * @param value The value to validate
     * @returns boolean
     */
    isValid(value: any): boolean {
        for (const rule of this.rules) {
            if (!rule.isValid(value)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get Type
     *
     * Returns validator type.
     *
     * @returns string
     */
    getType(): string {
        return this.type;
    }

    /**
     * Is array
     *
     * Function will return true if object is array.
     *
     * @returns boolean
     */
    isArray(): boolean {
        return true;
    }
}