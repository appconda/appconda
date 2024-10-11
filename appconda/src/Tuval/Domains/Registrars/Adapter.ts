
import { Adapter as DomainsAdapter } from '../Adapter';
import { Contact } from '../Contact';


export abstract class Adapter extends DomainsAdapter {
    /**
     * @param  {string} domain
     * @return {boolean}
     */
    abstract available(domain: string): Promise<boolean>;

    /**
     * @param  {string} domain
     * @param  {Contact[]} contacts
     * @param  {any[]} nameservers
     * @return {any[]}
     */
    abstract purchase(domain: string, contacts: Contact[], nameservers?: any[]): Promise<any[]>;

    /**
     * @param  {any[] | string} query
     * @param  {any[]} tlds
     * @param  {number} minLength
     * @param  {number} maxLength
     * @return {any[]}
     */
    abstract suggest(query: any[] | string, tlds?: any[], minLength?: number, maxLength?: number): Promise<any>;

    /**
     * @return {any[]}
     */
    abstract tlds(): any[];

    /**
     * @param  {string} domain
     * @return {any[]}
     */
    abstract getDomain(domain: string): Promise<any>;

    /**
     * @param  {string} domain
     * @param  {number} years
     * @return {any[]}
     */
    abstract renew(domain: string, years: number): Promise<any>;

    /**
     * @param  {string} domain
     * @param  {Contact[]} contacts
     * @param  {any[]} nameservers
     * @return {any[]}
     */
    abstract transfer(domain: string, contacts: Contact[], nameservers?: any[]): Promise<any[]>;
}
