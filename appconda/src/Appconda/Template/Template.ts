import { readFileSync, existsSync } from 'fs';
import * as fs from 'fs/promises';
import { parse as parseUrl, format as formatUrl } from 'url';
import { View } from '../Tuval/View';
import { Exception } from '../../Tuval/Core';

export class Template extends View {
    protected content: string = '';

    /**
     * Creates a new Template() from the file at path
     */
    public static fromFile(path: string): Template {
        if (!existsSync(path)) {
            throw new Exception(`${path} view template is not readable.`);
        }

        const template = new Template();
        return template.setPath(path);
    }

    /**
     * Creates a new Template() using a raw string
     */
    public static fromString(content: string): Template {
        if (!content) {
            throw new Exception('Empty string');
        }

        const template = new Template();
        template.content = content;
        return template;
    }

    /**
     * Render view template file if template has not been set as rendered yet.
     * In case path is not readable throws Exception.
     */
    //@ts-ignore
    public async render(minify: boolean = true): Promise<string> {
        if (this.rendered) {
            return '';
          }
      
          let template = '';
      
          if (this.path) {
            try {
              template = await fs.readFile(this.path, 'utf-8');
            } catch {
              throw new Error(`"${this.path}" template is not readable or not found.`);
            }
          } else if (this.content) {
            template = this.content;
          }
      
          // Replace variables inside the params and then replace them in the template
          Object.keys(this.params).forEach((key) => {
            this.params[key] = this.params[key].replace(new RegExp(key, 'g'), this.params[key]);
          });
          template = template.replace(new RegExp(Object.keys(this.params).join('|'), 'g'), (matched) => this.params[matched]);
      
          if (minify) {
            // You can add a minification step here if needed.
            template = template.replace(/\s+/g, ' ').trim();
          }
      
          return template;
    }

   

    /**
     * Parse URL string to array
     */
    public static parseURL(url: string): ReturnType<typeof parseUrl> {
        return parseUrl(url);
    }

    /**
     * Convert PHP array to query string
     */
    public static unParseURL(url: ReturnType<typeof parseUrl>): string {
        return formatUrl(url);
    }

    /**
     * Merge array of params to query string
     */
    public static mergeQuery(query1: string, query2: Record<string, any>): string {
        const parsed = new URLSearchParams(query1);
        Object.entries(query2).forEach(([key, value]) => {
            parsed.set(key, value);
        });
        return parsed.toString();
    }

    /**
     * Convert CamelCase to snake_case
     */
    public static fromCamelCaseToSnake(input: string): string {
        return input.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }

    /**
     * Convert CamelCase to dash-case
     */
    public static fromCamelCaseToDash(input: string): string {
        return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
