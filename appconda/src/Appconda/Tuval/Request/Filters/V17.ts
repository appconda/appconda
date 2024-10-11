import { Query } from '../../../../Tuval/Database';
import { Filter } from '../Filter';
import { Boolean, Exception } from '../../../../Tuval/Core';

class V17 extends Filter {
    protected static readonly CHAR_SINGLE_QUOTE = "'";
    protected static readonly CHAR_DOUBLE_QUOTE = '"';
    protected static readonly CHAR_COMMA = ',';
    protected static readonly CHAR_SPACE = ' ';
    protected static readonly CHAR_BRACKET_START = '[';
    protected static readonly CHAR_BRACKET_END = ']';
    protected static readonly CHAR_PARENTHESES_START = '(';
    protected static readonly CHAR_PARENTHESES_END = ')';
    protected static readonly CHAR_BACKSLASH = '\\';

    // Convert 1.4 params to 1.5
    public parse(content: Record<string, any>, model: string): Record<string, any> {
        switch (model) {
            case 'account.updateRecovery':
                delete content['passwordAgain'];
                break;
            // Queries
            case 'account.listIdentities':
            case 'account.listLogs':
            case 'databases.list':
            case 'databases.listLogs':
            case 'databases.listCollections':
            case 'databases.listCollectionLogs':
            case 'databases.listAttributes':
            case 'databases.listIndexes':
            case 'databases.listDocuments':
            case 'databases.getDocument':
            case 'databases.listDocumentLogs':
            case 'functions.list':
            case 'functions.listDeployments':
            case 'functions.listExecutions':
            case 'migrations.list':
            case 'projects.list':
            case 'proxy.listRules':
            case 'storage.listBuckets':
            case 'storage.listFiles':
            case 'teams.list':
            case 'teams.listMemberships':
            case 'teams.listLogs':
            case 'users.list':
            case 'users.listLogs':
            case 'users.listIdentities':
            case 'vcs.listInstallations':
                content = this.convertOldQueries(content);
                break;
        }
        return content;
    }

    private convertOldQueries(content: Record<string, any>): Record<string, any> {
        if (!content['queries']) {
            return content;
        }

        const parsed: string[] = [];
        for (const query of content['queries']) {
            try {
                const parsedQuery = this.parseQuery(query);
                parsed.push(JSON.stringify(parsedQuery.toArray()));
            } catch (error: any) {
                throw new Exception(`Invalid query: ${query}`,0,  error );
            }
        }

        content['queries'] = parsed;
        return content;
    }

    // 1.4 query parser
    public parseQuery(filter: string): Query {
        const paramsStart = filter.indexOf('(');

        if (paramsStart === -1) {
            throw new Error('Invalid query');
        }

        const method = filter.substring(0, paramsStart);
        const paramsEnd = filter.length - 1;
        const parametersStart = paramsStart + 1;

        if (method.includes('.')) {
            throw new Error('Invalid query method');
        }

        let currentParam = "";
        let currentArrayParam: string[] = [];
        const stack: string[] = [];
        let stackCount = 0;
        let stringStackState: string | null = null;

        const params: (string | string[])[] = [];

        for (let i = parametersStart; i < paramsEnd; i++) {
            const char = filter[i];
            const isStringStack = stringStackState !== null;
            const isArrayStack = !isStringStack && stackCount > 0;

            if (char === V17.CHAR_BACKSLASH) {
                if (!this.isSpecialChar(filter[i + 1])) {
                    this.appendSymbol(isStringStack, filter[i], i, filter, currentParam);
                }
                this.appendSymbol(isStringStack, filter[i + 1], i, filter, currentParam);
                i++;
                continue;
            }

            if (this.isQuote(char) && (filter[i - 1] !== V17.CHAR_BACKSLASH || filter[i - 2] === V17.CHAR_BACKSLASH)) {
                if (isStringStack) {
                    if (char === stringStackState) {
                        stringStackState = null;
                    }
                    this.appendSymbol(isStringStack, char, i, filter, currentParam);
                } else {
                    stringStackState = char;
                    this.appendSymbol(isStringStack, char, i, filter, currentParam);
                }
                continue;
            }

            if (!isStringStack) {
                if (char === V17.CHAR_BRACKET_START) {
                    stack.push(char);
                    stackCount++;
                    continue;
                } else if (char === V17.CHAR_BRACKET_END) {
                    stack.pop();
                    stackCount--;

                    if (currentParam.length) {
                        currentArrayParam.push(currentParam);
                    }

                    params.push(currentArrayParam);
                    currentArrayParam = [];
                    currentParam = "";
                    continue;
                } else if (char === V17.CHAR_COMMA) {
                    if (isArrayStack) {
                        currentArrayParam.push(currentParam);
                        currentParam = "";
                    } else {
                        if (!currentArrayParam.length) {
                            if (currentParam.length) {
                                params.push(currentParam);
                            }
                            currentParam = "";
                        }
                    }
                    continue;
                }
            }

            this.appendSymbol(isStringStack, char, i, filter, currentParam);
        }

        if (currentParam.length) {
            params.push(currentParam);
            currentParam = "";
        }

        const parsedParams = params.map(param => {
            if (Array.isArray(param)) {
                return param.map(element => this.parseValue(element));
            }
            return this.parseValue(param);
        });

        switch (method) {
            case Query.TYPE_EQUAL:
            case Query.TYPE_NOT_EQUAL:
            case Query.TYPE_LESSER:
            case Query.TYPE_LESSER_EQUAL:
            case Query.TYPE_GREATER:
            case Query.TYPE_GREATER_EQUAL:
            case Query.TYPE_CONTAINS:
            case Query.TYPE_SEARCH:
            case Query.TYPE_IS_NULL:
            case Query.TYPE_IS_NOT_NULL:
            case Query.TYPE_STARTS_WITH:
            case Query.TYPE_ENDS_WITH:
                const attribute = parsedParams[0] ?? '';
                if (parsedParams.length < 2) {
                    return new Query(method, attribute);
                }
                return new Query(method, attribute, Array.isArray(parsedParams[1]) ? parsedParams[1] : [parsedParams[1]]);

            case Query.TYPE_BETWEEN:
                return new Query(method, parsedParams[0], [parsedParams[1], parsedParams[2]]);
            case Query.TYPE_SELECT:
                return new Query(method, parsedParams[0] );
            case Query.TYPE_ORDER_ASC:
            case Query.TYPE_ORDER_DESC:
                return new Query(method, parsedParams[0] ?? '');

            case Query.TYPE_LIMIT:
            case Query.TYPE_OFFSET:
            case Query.TYPE_CURSOR_AFTER:
            case Query.TYPE_CURSOR_BEFORE:
                if (parsedParams.length > 0) {
                    return new Query(method, parsedParams[0]);
                }
                return new Query(method);

            default:
                return new Query(method);
        }
    }

    private parseValue(value: string): any {
        value = value.trim();

        if (value === 'false') {
            return false;
        } else if (value === 'true') {
            return true;
        } else if (value === 'null') {
            return null;
        } else if (!isNaN(Number(value))) {
            return Number(value);
        } else if (value.startsWith(V17.CHAR_DOUBLE_QUOTE) || value.startsWith(V17.CHAR_SINGLE_QUOTE)) {
            return value.slice(1, -1);
        }

        return value;
    }

    private appendSymbol(isStringStack: boolean, char: string, index: number, filter: string, currentParam: string): void {
        const canBeIgnored = char === V17.CHAR_SPACE || char === V17.CHAR_COMMA;

        if (canBeIgnored) {
            if (isStringStack) {
                currentParam += char;
            }
        } else {
            currentParam += char;
        }
    }

    private isQuote(char: string): boolean {
        return char === V17.CHAR_SINGLE_QUOTE || char === V17.CHAR_DOUBLE_QUOTE;
    }

    private isSpecialChar(char: string): boolean {
        return [
            V17.CHAR_COMMA,
            V17.CHAR_BRACKET_END,
            V17.CHAR_BRACKET_START,
            V17.CHAR_DOUBLE_QUOTE,
            V17.CHAR_SINGLE_QUOTE
        ].includes(char);
    }
}

export { V17 };