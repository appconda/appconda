/**
 * JS Formula Parser
 * -------------------
 * (c) 2012-2023 Alexander Schenkel, alex@alexi.ch
 *
 * JS Formula Parser takes a string, parses its mathmatical formula
 * and creates an evaluatable Formula object of it.
 *
 * Example input:
 *
 * var fObj = new Formula('sin(PI*x)/(2*PI)');
 * var result = fObj.evaluate({x: 2});
 * var results = fObj.evaluate([
 *     {x: 2},
 *     {x: 4},
 *     {x: 8}
 * ]);
 *
 * LICENSE:
 * -------------
 * MIT license, see LICENSE file
 */
const MATH_CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    SQRT1_2: Math.SQRT1_2,
    SQRT2: Math.SQRT2
};

declare global {
    interface Math {
        [key: string]: number | Function;
    }
}

type FormulaOptions = {
    memoization?: boolean;
};

type ValueObject = {
    [key: string]: number | Function | ValueObject;
};

class Expression {
    static createOperatorExpression(operator: string, left: Expression, right: Expression) {
        if (operator === '^') {
            return new PowerExpression(left, right);
        }
        if (operator === '*' || operator === '/') {
            return new MultDivExpression(operator, left, right);
        }
        if (operator === '+' || operator === '-') {
            return new PlusMinusExpression(operator, left, right);
        }
        throw new Error(`Unknown operator: ${operator}`);
    }

    evaluate(params: ValueObject = {}): number {
        throw new Error('Empty Expression - Must be defined in child classes');
    }

    toString() {
        return '';
    }
}

class BracketExpression extends Expression {
    innerExpression: Expression;

    constructor(expr: Expression) {
        super();
        this.innerExpression = expr;
        if (!(this.innerExpression instanceof Expression)) {
            throw new Error('No inner expression given for bracket expression');
        }
    }
    evaluate(params = {}): number {
        return this.innerExpression.evaluate(params);
    }
    toString() {
        return `(${this.innerExpression.toString()})`;
    }
}

class ValueExpression extends Expression {
    value: number;

    constructor(value: number | string) {
        super();
        this.value = Number(value);
        if (isNaN(this.value)) {
            throw new Error('Cannot parse number: ' + value);
        }
    }
    evaluate(): number {
        return this.value;
    }
    toString() {
        return String(this.value);
    }
}

class PlusMinusExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;

    constructor(operator: string, left: Expression, right: Expression) {
        super();
        if (!['+', '-'].includes(operator)) {
            throw new Error(`Operator not allowed in Plus/Minus expression: ${operator}`);
        }
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    evaluate(params: ValueObject = {}): number {
        if (this.operator === '+') {
            return this.left.evaluate(params) + this.right.evaluate(params);
        }
        if (this.operator === '-') {
            return this.left.evaluate(params) - this.right.evaluate(params);
        }
        throw new Error('Unknown operator for PlusMinus expression');
    }

    toString() {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}

class MultDivExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;

    constructor(operator: string, left: Expression, right: Expression) {
        super();
        if (!['*', '/'].includes(operator)) {
            throw new Error(`Operator not allowed in Multiply/Division expression: ${operator}`);
        }
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    evaluate(params: ValueObject = {}): number {
        if (this.operator === '*') {
            return this.left.evaluate(params) * this.right.evaluate(params);
        }
        if (this.operator === '/') {
            return this.left.evaluate(params) / this.right.evaluate(params);
        }
        throw new Error('Unknown operator for MultDiv expression');
    }

    toString() {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}

class PowerExpression extends Expression {
    base: Expression;
    exponent: Expression;

    constructor(base: Expression, exponent: Expression) {
        super();
        this.base = base;
        this.exponent = exponent;
    }

    evaluate(params: ValueObject = {}): number {
        return Math.pow(this.base.evaluate(params), this.exponent.evaluate(params));
    }

    toString() {
        return `${this.base.toString()}^${this.exponent.toString()}`;
    }
}
class FunctionExpression extends Expression {
    fn: string;
    varPath: string[];
    argumentExpressions: Expression[];
    formulaObject: Formula | null;
    blacklisted: boolean | undefined;

    constructor(fn: string | null, argumentExpressions: Expression[], formulaObject: Formula | null = null) {
        super();
        this.fn = fn ?? '';
        this.varPath = this.fn.split('.');
        this.argumentExpressions = argumentExpressions || [];
        this.formulaObject = formulaObject;
        this.blacklisted = undefined;
    }

    evaluate(params: ValueObject = {}): number {
        params = params || {};
        const paramValues = this.argumentExpressions.map((a) => a.evaluate(params));

        // If the params object itself has a function definition with
        // the function name, call this one:
        // let fn = params[this.fn];
        try {
            let fn = getProperty(params, this.varPath, this.fn);
            if (fn instanceof Function) {
                return fn.apply(this, paramValues);
            }
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }

        let objFn;
        try {
            // perhaps the Formula object has the function? so call it:
            objFn = getProperty(this.formulaObject ?? {}, this.varPath, this.fn);
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }
        if (this.formulaObject && objFn instanceof Function) {
            // Don't, if it is blacklisted:
            if (this.isBlacklisted()) {
                throw new Error('Blacklisted function called: ' + this.fn);
            }
            return objFn.apply(this.formulaObject, paramValues);
        }

        try {
            // Has the JS Math object a function as requested? Call it:
            const mathFn = getProperty(Math, this.varPath, this.fn);
            if (mathFn instanceof Function) {
                return mathFn.apply(this, paramValues);
            }
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }
        // No more options left: sorry!
        throw new Error('Function not found: ' + this.fn);
    }

    toString() {
        return `${this.fn}(${this.argumentExpressions.map((a) => a.toString()).join(', ')})`;
    }

    isBlacklisted() {
        // cache evaluation of blacklisted function, to save call time:
        if (this.blacklisted === undefined) {
            this.blacklisted = Formula.functionBlacklist.includes(
                this.formulaObject ? this.formulaObject[this.fn] : null
            );
        }
        return this.blacklisted;
    }
}

function getProperty(object: ValueObject, path: string[], fullPath: string) {
    let curr: number | Function | ValueObject = object;
    for (let propName of path) {
        if (typeof curr !== 'object') {
            throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
        }
        if (curr[propName] === undefined) {
            throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
        }
        curr = curr[propName];
    }

    if (typeof curr === 'object') {
        throw new Error('Invalid value');
    }

    return curr;
}

class VariableExpression extends Expression {
    fullPath: string;
    varPath: string[];
    formulaObject: Formula | null;

    constructor(fullPath: string, formulaObj: Formula | null = null) {
        super();
        this.formulaObject = formulaObj;
        this.fullPath = fullPath;
        this.varPath = fullPath.split('.');
    }

    evaluate(params = {}) {
        // params contain variable / value pairs: If this object's variable matches
        // a varname found in the params, return the value.
        // eg: params = {x: 5,y:3}, varname = x, return 5
        // Objects and arrays are also supported:
        // e.g. params = {x: {y: 5}}, varname = x.y, return 5
        //  or  params = {x: [2,4,6]}, varname = x.2, return 6

        // Let's look in the value object first:
        let value: any = undefined;
        try {
            value = getProperty(params, this.varPath, this.fullPath);
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }
        if (value === undefined) {
            // Now have a look at the formula object:
            // This will throw an error if the property is not found:
            value = getProperty(this.formulaObject ?? {}, this.varPath, this.fullPath);
        }
        if (typeof value === 'function' || typeof value === 'object') {
            throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
        }

        return Number(value);
    }
    toString() {
        return `${this.varPath.join('.')}`;
    }
}

export class Formula {
    [key: string]: any;
    static Expression = Expression;
    static BracketExpression = BracketExpression;
    static PowerExpression = PowerExpression;
    static MultDivExpression = MultDivExpression;
    static PlusMinusExpression = PlusMinusExpression;
    static ValueExpression = ValueExpression;
    static VariableExpression = VariableExpression;
    static FunctionExpression = FunctionExpression;
    static MATH_CONSTANTS = MATH_CONSTANTS;

    // Create a function blacklist:
    static functionBlacklist = Object.getOwnPropertyNames(Formula.prototype)
        .filter((prop) => Formula.prototype[prop] instanceof Function)
        .map((prop) => Formula.prototype[prop]);

    public formulaExpression: Expression | null;
    public options: FormulaOptions;
    public formulaStr: string;
    private _variables: string[];
    private _memory: { [key: string]: number };

    /**
     * Creates a new Formula instance
     *
     * Optional configuration can be set in the options object:
     *
     * - memoization (bool): If true, results are stored and re-used when evaluate() is called with the same parameters
     *
     * @param {String} fStr The formula string, e.g. 'sin(x)/cos(y)'
     * @param {Object} options An options object. Supported options:
     *    - memoization (bool): If true, results are stored and re-used when evaluate() is called with the same parameters
     * @param {Formula} parentFormula Internally used to build a Formula AST
     */
    constructor(fStr: string, options: FormulaOptions | null = {}) {
        this.formulaExpression = null;
        this.options = { ...{ memoization: false }, ...options };
        this.formulaStr = '';
        this._variables = [];
        this._memory = {};
        this.setFormula(fStr);
    }

    /**
     * Re-sets the given String and parses it to a formula expression. Can be used after initialization,
     * to re-use the Formula object.
     *
     * @param {String} formulaString The formula string to set/parse
     * @return {this} The Formula object (this)
     */
    setFormula(formulaString: string) {
        if (formulaString) {
            this.formulaExpression = null;
            this._variables = [];
            this._memory = {};
            this.formulaStr = formulaString;
            this.formulaExpression = this.parse(formulaString);
        }
        return this;
    }

    /**
     * Enable memoization: An expression is only evaluated once for the same input.
     * Further evaluations with the same input will return the in-memory stored result.
     */
    enableMemoization() {
        this.options.memoization = true;
    }

    /**
     * Disable in-memory memoization: each call to evaluate() is executed from scratch.
     */
    disableMemoization() {
        this.options.memoization = false;
        this._memory = {};
    }

    /**
     * Splits the given string by ',', makes sure the ',' is not within
     * a sub-expression
     * e.g.: str = "x,pow(3,4)" returns 2 elements: x and pow(3,4).
     */
    splitFunctionParams(toSplit: string) {
        // do not split on ',' within matching brackets.
        let pCount = 0,
            paramStr: any = '';
        const params: any = [];
        for (let chr of toSplit.split('')) {
            if (chr === ',' && pCount === 0) {
                // Found function param, save 'em
                params.push(paramStr);
                paramStr = '';
            } else if (chr === '(') {
                pCount++;
                paramStr += chr;
            } else if (chr === ')') {
                pCount--;
                paramStr += chr;
                if (pCount < 0) {
                    throw new Error('ERROR: Too many closing parentheses!');
                }
            } else {
                paramStr += chr;
            }
        }
        if (pCount !== 0) {
            throw new Error('ERROR: Too many opening parentheses!');
        }
        if (paramStr.length > 0) {
            params.push(paramStr);
        }
        return params;
    }

    /**
     * Cleans the input string from unnecessary whitespace,
     * and replaces some known constants:
     */
    cleanupInputString(s: string) {
        s = s.replace(/\s+/g, '');
        // surround known math constants with [], to parse them as named variables [xxx]:
        Object.keys(MATH_CONSTANTS).forEach((c) => {
            s = s.replace(new RegExp(`\\b${c}\\b`, 'g'), `[${c}]`);
        });
        return s;
    }

    /**
     * Parses the given formula string by using a state machine into a single Expression object,
     * which represents an expression tree (aka AST).
     *
     * First, we split the string into 'expression': An expression can be:
     *   - a number, e.g. '3.45'
     *   - an unknown variable, e.g. 'x'
     *   - a single char operator, such as '*','+' etc...
     *   - a named variable, in [], e.g. [myvar]
     *   - a function, such as sin(x)
     *   - a parenthessed expression, containing other expressions
     *
     * We want to create an expression tree out of the string. This is done in 2 stages:
     * 1. form single expressions from the string: parse the string into known expression objects:
     *   - numbers/variables
     *   - operators
     *   - braces (with a sub-expression)
     *   - functions (with sub-expressions (aka argument expressions))
     *   This will lead to an array of expressions.
     *  As an example:
     *  "2 + 3 * (4 + 3 ^ 5) * sin(PI * x)" forms an array of the following expressions:
     *  `[2, +, 3, *, bracketExpr(4,+,3,^,5), * , functionExpr(PI,*,x)]`
     * 2. From the raw expression array we form an expression tree by evaluating the expressions in the correct order:
     *    e.g.:
     *  the expression array `[2, +, 3, *, bracketExpr(4,+,3,^,5), * , functionExpr(PI,*,x)]` will be transformed into the expression tree:
     *  ```
     *         root expr:  (+)
     *                     / \
     *                    2    (*)
     *                        / \
     *                     (*)  functionExpr(...)
     *                     / \
     *                    3   (bracket(..))
     * ```
     *
     * In the end, we have a single root expression node, which then can be evaluated in the evaluate() function.
     *
     * @param {String} str The formula string, e.g. '3*sin(PI/x)'
     * @returns {Expression} An expression object, representing the expression tree
     */
    parse(str: string) {
        // clean the input string first. spaces, math constant replacements etc.:
        str = this.cleanupInputString(str);
        // start recursive call to parse:
        return this._do_parse(str);
    }

    /**
     * @see parse(): this is the recursive parse function, without the clean string part.
     * @param {String} str
     * @returns {Expression} An expression object, representing the expression tree
     */
    _do_parse(str: string): Expression {
        let lastChar = str.length - 1,
            act = 0,
            state:
                | 'initial'
                | 'within-nr'
                | 'within-parentheses'
                | 'within-func-parentheses'
                | 'within-named-var'
                | 'within-expr'
                | 'within-bracket'
                | 'within-func'
                | 'invalid' = 'initial',
            expressions: any = [],
            char = '',
            tmp = '',
            funcName: any = null,
            pCount = 0;

        while (act <= lastChar) {
            switch (state) {
                case 'initial':
                    // None state, the beginning. Read a char and see what happens.
                    char = str.charAt(act);
                    if (char.match(/[0-9.]/)) {
                        // found the beginning of a number, change state to "within-number"
                        state = 'within-nr';
                        tmp = '';
                        act--;
                    } else if (this.isOperator(char)) {
                        // Simple operators. Note: '-' must be treaten specially,
                        // it could be part of a number.
                        // it MUST be part of a number if the last found expression
                        // was an operator (or the beginning):
                        if (char === '-') {
                            if (expressions.length === 0 || this.isOperatorExpr(expressions[expressions.length - 1])) {
                                state = 'within-nr';
                                tmp = '-';
                                break;
                            }
                        }

                        // Found a simple operator, store as expression:
                        if (act === lastChar || this.isOperatorExpr(expressions[expressions.length - 1])) {
                            state = 'invalid'; // invalid to end with an operator, or have 2 operators in conjunction
                            break;
                        } else {
                            expressions.push(
                                Expression.createOperatorExpression(char, new Expression(), new Expression())
                            );
                            state = 'initial';
                        }
                    } else if (char === '(') {
                        // left parenthes found, seems to be the beginning of a new sub-expression:
                        state = 'within-parentheses';
                        tmp = '';
                        pCount = 0;
                    } else if (char === '[') {
                        // left named var separator char found, seems to be the beginning of a named var:
                        state = 'within-named-var';
                        tmp = '';
                    } else if (char.match(/[a-zA-Z]/)) {
                        // multiple chars means it may be a function, else its a var which counts as own expression:
                        if (act < lastChar && str.charAt(act + 1).match(/[a-zA-Z0-9_.]/)) {
                            tmp = char;
                            state = 'within-func';
                        } else {
                            // Single variable found:
                            // We need to check some special considerations:
                            // - If the last char was a number (e.g. 3x), we need to create a multiplication out of it (3*x)
                            if (
                                expressions.length > 0 &&
                                expressions[expressions.length - 1] instanceof ValueExpression
                            ) {
                                expressions.push(
                                    Expression.createOperatorExpression('*', new Expression(), new Expression())
                                );
                            }
                            expressions.push(new VariableExpression(char, this));
                            this.registerVariable(char);
                            state = 'initial';
                            tmp = '';
                        }
                    }
                    break;
                case 'within-nr':
                    char = str.charAt(act);
                    if (char.match(/[0-9.]/)) {
                        //Still within number, store and continue
                        tmp += char;
                        if (act === lastChar) {
                            expressions.push(new ValueExpression(tmp));
                            state = 'initial';
                        }
                    } else {
                        // Number finished on last round, so add as expression:
                        if (tmp === '-') {
                            // just a single '-' means: a variable could follow (e.g. like in 3*-x), we convert it to -1: (3*-1x)
                            tmp = '-1';
                        }
                        expressions.push(new ValueExpression(tmp));
                        tmp = '';
                        state = 'initial';
                        act--;
                    }
                    break;

                case 'within-func':
                    char = str.charAt(act);
                    if (char.match(/[a-zA-Z0-9_.]/)) {
                        tmp += char;
                    } else if (char === '(') {
                        funcName = tmp;
                        tmp = '';
                        pCount = 0;
                        state = 'within-func-parentheses';
                    } else {
                        throw new Error('Wrong character for function at position ' + act);
                    }

                    break;

                case 'within-named-var':
                    char = str.charAt(act);
                    if (char === ']') {
                        // end of named var, create expression:
                        expressions.push(new VariableExpression(tmp, this));
                        this.registerVariable(tmp);
                        tmp = '';
                        state = 'initial';
                    } else if (char.match(/[a-zA-Z0-9_.]/)) {
                        tmp += char;
                    } else {
                        throw new Error('Character not allowed within named variable: ' + char);
                    }
                    break;

                case 'within-parentheses':
                case 'within-func-parentheses':
                    char = str.charAt(act);
                    if (char === ')') {
                        //Check if this is the matching closing parenthesis.If not, just read ahead.
                        if (pCount <= 0) {
                            // Yes, we found the closing parenthesis, create new sub-expression:
                            if (state === 'within-parentheses') {
                                expressions.push(new BracketExpression(this._do_parse(tmp)));
                            } else if (state === 'within-func-parentheses') {
                                // Function found: create expressions from the inner argument
                                // string, and create a function expression with it:
                                let args = this.splitFunctionParams(tmp).map((a) => this._do_parse(a));
                                expressions.push(new FunctionExpression(funcName, args, this));
                                funcName = null;
                            }
                            state = 'initial';
                        } else {
                            pCount--;
                            tmp += char;
                        }
                    } else if (char === '(') {
                        // begin of a new sub-parenthesis, increase counter:
                        pCount++;
                        tmp += char;
                    } else {
                        // all other things are just added to the sub-expression:
                        tmp += char;
                    }
                    break;
            }
            act++;
        }

        if (state !== 'initial') {
            throw new Error('Could not parse formula: Syntax error.');
        }

        return this.buildExpressionTree(expressions);
    }

    /**
     * @see parse(): Builds an expression tree from the given expression array.
     * Builds a tree with a single root expression in the correct order of operator precedence.
     *
     * Note that the given expression objects are modified and linked.
     *
     * @param {*} expressions
     * @return {Expression} The root Expression of the built expression tree
     */
    buildExpressionTree(expressions: Expression[]): Expression {
        if (expressions.length < 1) {
            throw new Error('No expression given!');
        }
        const exprCopy = [...expressions];
        let idx = 0;
        let expr: any = null;
        // Replace all Power expressions with a partial tree:
        while (idx < exprCopy.length) {
            expr = exprCopy[idx];
            if (expr instanceof PowerExpression) {
                if (idx === 0 || idx === exprCopy.length - 1) {
                    throw new Error('Wrong operator position!');
                }
                expr.base = exprCopy[idx - 1];
                expr.exponent = exprCopy[idx + 1];
                exprCopy[idx - 1] = expr;
                exprCopy.splice(idx, 2);
            } else {
                idx++;
            }
        }

        // Replace all Mult/Div expressions with a partial tree:
        idx = 0;
        expr = null;
        while (idx < exprCopy.length) {
            expr = exprCopy[idx];
            if (expr instanceof MultDivExpression) {
                if (idx === 0 || idx === exprCopy.length - 1) {
                    throw new Error('Wrong operator position!');
                }
                expr.left = exprCopy[idx - 1];
                expr.right = exprCopy[idx + 1];
                exprCopy[idx - 1] = expr;
                exprCopy.splice(idx, 2);
            } else {
                idx++;
            }
        }

        // Replace all Plus/Minus expressions with a partial tree:
        idx = 0;
        expr = null;
        while (idx < exprCopy.length) {
            expr = exprCopy[idx];
            if (expr instanceof PlusMinusExpression) {
                if (idx === 0 || idx === exprCopy.length - 1) {
                    throw new Error('Wrong operator position!');
                }
                expr.left = exprCopy[idx - 1];
                expr.right = exprCopy[idx + 1];
                exprCopy[idx - 1] = expr;
                exprCopy.splice(idx, 2);
            } else {
                idx++;
            }
        }
        if (exprCopy.length !== 1) {
            throw new Error('Could not parse formula: incorrect syntax?');
        }
        return exprCopy[0];
    }

    isOperator(char: string | null) {
        return typeof char === 'string' && char.match(/[+\-*/^]/);
    }

    isOperatorExpr(expr: Expression) {
        return (
            expr instanceof PlusMinusExpression || expr instanceof MultDivExpression || expr instanceof PowerExpression
        );
    }

    registerVariable(varName: string) {
        if (this._variables.indexOf(varName) < 0) {
            this._variables.push(varName);
        }
    }

    getVariables() {
        return this._variables;
    }

    /**
     * Evaluates a Formula by delivering values for the Formula's variables.
     * E.g. if the formula is '3*x^2 + 2*x + 4', you should call `evaulate` as follows:
     *
     * evaluate({x:2}) --> Result: 20
     *
     * @param {ValueObject|Array<ValueObject>} valueObj An object containing values for variables and (unknown) functions,
     *   or an array of such objects: If an array is given, all objects are evaluated and the results
     *   also returned as array.
     * @return {Number|Array<Number>} The evaluated result, or an array with results
     */
    evaluate(valueObj: ValueObject | ValueObject[]): number | number[] {
        // resolve multiple value objects recursively:
        if (valueObj instanceof Array) {
            return valueObj.map((v) => this.evaluate(v)) as number[];
        }
        let expr = this.getExpression();
        if (!(expr instanceof Expression)) {
            throw new Error('No expression set: Did you init the object with a Formula?');
        }
        if (this.options.memoization) {
            let res = this.resultFromMemory(valueObj);
            if (res !== null) {
                return res;
            } else {
                res = expr.evaluate({ ...MATH_CONSTANTS, ...valueObj });
                this.storeInMemory(valueObj, res);
                return res;
            }
        }
        return expr.evaluate({ ...MATH_CONSTANTS, ...valueObj });
    }

    hashValues(valueObj: ValueObject) {
        return JSON.stringify(valueObj);
    }

    resultFromMemory(valueObj: ValueObject): number | null {
        let key = this.hashValues(valueObj);
        let res = this._memory[key];
        if (res !== undefined) {
            return res;
        } else {
            return null;
        }
    }

    storeInMemory(valueObj: ValueObject, value: number) {
        this._memory[this.hashValues(valueObj)] = value;
    }

    getExpression() {
        return this.formulaExpression;
    }

    getExpressionString() {
        return this.formulaExpression ? this.formulaExpression.toString() : '';
    }

    static calc(formula: string, valueObj: ValueObject | null = null, options = {}) {
        valueObj = valueObj ?? {};
        return new Formula(formula, options).evaluate(valueObj);
    }
}