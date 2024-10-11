import { readFileSync, existsSync } from 'fs';
import { Exception } from './Exception';
import Handlebars from 'handlebars';


class View {
    public static readonly FILTER_ESCAPE = 'escape';
    public static readonly FILTER_NL2P = 'nl2p';

    protected parent: View | null = null;
    protected path: string = '';
    protected rendered: boolean = false;
    protected params: Record<string, any> = {};
    protected filters: Record<string, (value: string) => string> = {};

    constructor(path: string = '') {
        this.setPath(path);

        this.addFilter(View.FILTER_ESCAPE, (value: string) => {
            return value.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#' + i.charCodeAt(0) + ';';
            });
        });

        this.addFilter(View.FILTER_NL2P, (value: string) => {
            let paragraphs = '';
            value.split('\n\n').forEach(line => {
                if (line.trim()) {
                    paragraphs += `<p>${line}</p>`;
                }
            });
            return paragraphs.replace(/\n/g, '<br />');
        });
    }

    public setParam(key: string, value: any, escapeHtml: boolean = true): this {
        if (key.includes('.')) {
            throw new Exception('$key can\'t contain a dot "." character');
        }

        if (typeof value === 'string' && escapeHtml) {
            value = value.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                return '&#' + i.charCodeAt(0) + ';';
            });
        }

        this.params[key] = value;
        return this;
    }

    public setParent(view: View): this {
        this.parent = view;
        return this;
    }

    public getParent(): View | null {
        return this.parent;
    }

    public getParam(path: string, defaultValue: any = null): any {
        const keys = path.split('.');
        let temp = this.params;

        for (const key of keys) {
            temp = temp[key];
            if (temp === undefined) {
                return defaultValue;
            }
        }

        return temp;
    }

    public setPath(path: string): this {
        this.path = path;
        return this;
    }

    public setRendered(state: boolean = true): this {
        this.rendered = state;
        return this;
    }

    public isRendered(): boolean {
        return this.rendered;
    }

    public addFilter(name: string, callback: (value: string) => string): this {
        this.filters[name] = callback;
        return this;
    }

    public print(value: any, filter: string | string[] = ''): any {
        if (filter) {
            if (Array.isArray(filter)) {
                for (const callback of filter) {
                    if (!this.filters[callback]) {
                        throw new Exception(`Filter "${callback}" is not registered`);
                    }
                    value = this.filters[callback](value);
                }
            } else {
                if (!this.filters[filter]) {
                    throw new Exception(`Filter "${filter}" is not registered`);
                }
                value = this.filters[filter](value);
            }
        }
        return value;
    }

    public render(minify: boolean = true): string {
        if (this.rendered) {
            return '';
        }

        let html = '';

        if (existsSync(this.path)) {
            html = readFileSync(this.path, 'utf-8');
        } else {
            throw new Exception(`"${this.path}" view template is not readable`);
        }

        const template = Handlebars.compile(html);
        html = template(this.params);

        if (minify) {
            html = this.minifyHtml(html);
        }

    
        return html;
    }

    private minifyHtml(html: string): string {

        

        const search = [
            />[^\S ]+/g,  // strip whitespaces after tags, except space
            /[^\S ]+</g,  // strip whitespaces before tags, except space
            /\s+/g,       // shorten multiple whitespace sequences
        ];

        const replace = [
            '>',
            '<',
            ' ',
        ];

        

        return html.replace(search[0], replace[0])
                   .replace(search[1], replace[1])
                   .replace(search[2], replace[2]);
    }

    public exec(view: View | View[]): string {
        let output = '';

        if (Array.isArray(view)) {
            for (const node of view) {
                if (node instanceof View) {
                    node.setParent(this);
                    output += node.render();
                }
            }
        } else if (view instanceof View) {
            view.setParent(this);
            output = view.render();
        }

        return output;
    }
}

export { View };