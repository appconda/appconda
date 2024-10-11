
import { Adapter } from './Adapter';
import { Contact } from '../Contact';
import * as CryptoJS from 'crypto-js';

export class OpenSRS extends Adapter {
    protected defaultNameservers: string[];
    protected user: { username: string; password: string };
    protected endpoint: string;
    protected apiKey: string;
    protected apiSecret: string;

    /**
     * __construct
     * Instantiate a new adapter.
     *
     * @param  {string} apiKey
     * @param  {string} apiSecret
     * @param  {string} username
     * @param  {string} password
     * @param  {string[]} defaultNameservers
     * @param  {boolean} production
     */
    constructor(apiKey: string, apiSecret: string, username: string, password: string, defaultNameservers: string[], production: boolean = false) {
        super(production ? 'https://rr-n1-tor.opensrs.net:55443' : 'https://horizon.opensrs.net:55443', apiKey, apiSecret);

        this.endpoint = production ? 'https://rr-n1-tor.opensrs.net:55443' : 'https://horizon.opensrs.net:55443';
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.defaultNameservers = defaultNameservers;
        this.user = { username, password };
        this.headers = {
            'Content-Type': 'text/xml',
            'X-Username': this.apiSecret
        };
    }

    async send(params: { object: string; action: string; domain?: string; attributes: any }): Promise<string> {
        const { object, action, domain, attributes } = params;
        const xml = this.buildEnvelop(object, action, attributes, domain);

        const headers = {
            ...this.headers,
            'X-Signature': CryptoJS.MD5(CryptoJS.MD5(xml + this.apiKey).toString() + this.apiKey).toString()
        };

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: headers,
            body: xml,
        });

        return response.text();
    }

    async available(domain: string): Promise<boolean> {
        const result = await this.send({
            object: 'DOMAIN',
            action: 'LOOKUP',
            attributes: { domain },
        });

        const sanitizedResult = this.sanitizeResponse(result);
        const elements = sanitizedResult.querySelectorAll('body data_block dt_assoc item[key="response_code"]');

        return elements[0].textContent === '210';
    }

    private sanitizeResponse(response: string): Document {
        const parser = new DOMParser();
        const result = parser.parseFromString(response, 'application/xml');
        const elements = result.querySelectorAll('body data_block dt_assoc item[key="response_code"]');
        const code = parseInt(elements[0].textContent || '0', 10);

        if (code > 299) {
            const textElements = result.querySelectorAll('body data_block dt_assoc item[key="response_text"]');
            const text = textElements[0].textContent || '';
            throw new Error(text);
        }

        return result;
    }

    async updateNameservers(domain: string, nameservers: string[]): Promise<{ code: string; text: string; successful: boolean }> {
        const message = {
            object: 'DOMAIN',
            action: 'advanced_update_nameservers',
            domain,
            attributes: {
                add_ns: nameservers,
                op_type: 'add_remove',
            },
        };

        const result = await this.send(message);
        const sanitizedResult = this.sanitizeResponse(result);

        const successElements = sanitizedResult.querySelectorAll('body data_block dt_assoc item[key="is_success"]');
        const successful = successElements[0].textContent === '1';

        const textElements = sanitizedResult.querySelectorAll('body data_block dt_assoc item[key="response_text"]');
        const text = textElements[0].textContent || '';

        const codeElements = sanitizedResult.querySelectorAll('body data_block dt_assoc item[key="response_code"]');
        const code = codeElements[0].textContent || '';

        return { code, text, successful };
    }

    private async register(domain: string, regType: string, user: { username: string; password: string }, contacts: any[], nameservers: string[] = []): Promise<string> {
        const hasNameservers = nameservers.length > 0 ? 1 : 0;

        const message = {
            object: 'DOMAIN',
            action: 'SW_REGISTER',
            attributes: {
                domain,
                period: 1,
                contact_set: contacts,
                custom_tech_contact: 0,
                custom_nameservers: hasNameservers,
                reg_username: user.username,
                reg_password: user.password,
                reg_type: regType,
                handle: 'process',
                f_whois_privacy: 1,
                auto_renew: 0,
            },
        };

        if (hasNameservers) {
            message.attributes['nameserver_list'] = nameservers;
        }

        return await this.send(message);
    }

    async purchase(domain: string, contacts: Contact[], nameservers: string[] = []): Promise<any[]> {
        nameservers = nameservers.length === 0 ? this.defaultNameservers : nameservers;
        const sanitizedContacts = this.sanitizeContacts(contacts) as any;
        const regType = 'new';

        const result = await this.register(domain, regType, this.user, sanitizedContacts, nameservers);
        return this.response(result);
    }

    async transfer(domain: string, contacts: Contact[], nameservers: string[] = []): Promise<any[]> {
        nameservers = nameservers.length === 0 ? this.defaultNameservers : nameservers;
        const sanitizedContacts = this.sanitizeContacts(contacts) as any;
        const regType = 'transfer';

        const result = await this.register(domain, regType, this.user, sanitizedContacts, nameservers);
        return this.response(result);
    }

    async cancelPurchase(): Promise<boolean> {
        const timestamp = Math.floor(Date.now() / 1000);

        const message = {
            object: 'ORDER',
            action: 'cancel_pending_orders',
            attributes: {
                to_date: timestamp,
                status: ['declined', 'pending'],
            },
        };

        const result = await this.send(message);
        const sanitizedResult = this.sanitizeResponse(result);

        const successElements = sanitizedResult.querySelectorAll('body data_block dt_assoc item[key="is_success"]');
        return successElements[0].textContent === '1';
    }

    async suggest(query: string | string[], tlds: string[] = [], minLength: number = 1, maxLength: number = 100): Promise<Record<string, boolean>> {
        query = Array.isArray(query) ? query : [query];

        const message = {
            object: 'DOMAIN',
            action: 'name_suggest',
            attributes: {
                services: ['suggestion'],
                searchstring: query.join(' '),
                tlds,
            },
        };

        const xpath = '//body/data_block/dt_assoc/item[@key="attributes"]/dt_assoc/item[@key="suggestion"]/dt_assoc/item[@key="items"]/dt_array/item';

        const result = await this.send(message);
        const sanitizedResult = this.sanitizeResponse(result);
        const elements = sanitizedResult.querySelectorAll(xpath);

        const items: Record<string, boolean> = {};

        elements.forEach((element) => {
            const item = element.querySelectorAll('dt_assoc item');
            const domain = item[0].textContent || '';
            const available = item[1].textContent === 'available';
            items[domain] = available;
        });

        return items;
    }

    tlds(): string[] {
        // OpenSRS offers no endpoint for this
        return [];
    }

    async getDomain(domain: string): Promise<Record<string, string>> {
        const message = {
            object: 'domain',
            action: 'get',
            attributes: {
                domain,
                type: 'all_info',
                clean_ca_subset: 1,
            },
        };

        const xpath = '//body/data_block/dt_assoc/item[@key="attributes"]/dt_assoc/item';

        const result = await this.send(message);
        const sanitizedResult = this.sanitizeResponse(result);
        const elements = sanitizedResult.querySelectorAll(xpath);

        const results: Record<string, string> = {};

        elements.forEach((element) => {
            const key = element.getAttribute('key') || '';
            const value = element.textContent || '';
            results[key] = value;
        });

        return results;
    }

    async updateDomain(domain: string, contacts: Contact[], details: { data: any }): Promise<boolean> {
        const sanitizedContacts = this.sanitizeContacts(contacts);

        const message = {
            object: 'domain',
            action: 'modify',
            attributes: {
                domain,
                affect_domains: 0,
                data: details.data,
                contact_set: sanitizedContacts,
            },
        };

        const xpath = `//body/data_block/dt_assoc/item[@key="attributes"]/dt_assoc/item[@key="details"]/dt_assoc/item[@key="${domain}"]/dt_assoc/item[@key="is_success"]`;

        const result = await this.send(message);
        const sanitizedResult = this.sanitizeResponse(result);
        const elements = sanitizedResult.querySelectorAll(xpath);

        return elements[0].textContent === '1';
    }

    async renew(domain: string, years: number): Promise<Record<string, string>> {
        const message = {
            object: 'domain',
            action: 'renew',
            attributes: {
                domain,
                auto_renew: 0,
                currentexpirationyear: '2022',
                period: years,
                handle: 'process',
            },
        };

        const xpath = '//body/data_block/dt_assoc/item[@key="attributes"]/dt_assoc/item';

        const result = await this.send(message);
        const sanitizedResult = this.sanitizeResponse(result);
        const elements = sanitizedResult.querySelectorAll(xpath);

        const results: Record<string, string> = {};

        elements.forEach((item) => {
            const key = item.getAttribute('key') || '';
            const value = item.textContent || '';
            results[key] = value;
        });

        return results;
    }

    private response(xml: string): any {
        const doc = this.sanitizeResponse(xml);
        const elements = doc.querySelectorAll('data_block dt_assoc item[key="response_code"]');
        const responseCode = elements[0].textContent || '';

        const idElements = doc.querySelectorAll('data_block dt_assoc item[key="attributes"] dt_assoc item[key="id"]');
        const responseId = idElements.length > 0 ? idElements[0].textContent || '' : '';

        const domainIdElements = doc.querySelectorAll('data_block dt_assoc item[key="attributes"] dt_assoc item[key="domain_id"]');
        const responseDomainId = domainIdElements.length > 0 ? domainIdElements[0].textContent || '' : '';

        const successElements = doc.querySelectorAll('data_block dt_assoc item[key="is_success"]');
        const responseSuccessful = successElements[0].textContent === '1';

        return {
            code: responseCode,
            id: responseId,
            domainId: responseDomainId,
            successful: responseSuccessful,
        };
    }

    private createArray(key: string, ary: any[]): string {
        const result = [
            `<item key="${key}">`,
            '<dt_array>',
        ];

        ary.forEach((value, index) => {
            result.push(this.createEnvelopItem(index.toString(), value));
        });

        result.push('</dt_array>', '</item>');

        return result.join('\n');
    }

    private createEnvelopItem(key: string, value: string | number | any[]): string {
        if (Array.isArray(value)) {
            return this.createArray(key, value);
        }

        return `<item key="${key}">${value}</item>`;
    }

    private validateContact(contact: Record<string, any>): Record<string, any> {
        const required = [
            'firstname',
            'lastname',
            'email',
            'phone',
            'address1',
            'city',
            'state',
            'postalcode',
            'country',
            'owner',
            'org',
        ];

        const filter: Record<string, string> = {
            firstname: 'first_name',
            lastname: 'last_name',
            org: 'org_name',
            postalcode: 'postal_code',
        };

        const result: Record<string, any> = {};

        required.forEach((key) => {
            const lowerKey = key.toLowerCase();

            if (!contact[lowerKey]) {
                throw new Error(`Contact is missing required field: ${lowerKey}`);
            }

            const filteredKey = filter[lowerKey] || lowerKey;
            result[filteredKey] = contact[lowerKey];
        });

        return result;
    }

    private createContact(type: string, contact: Record<string, any>): string {
        const validatedContact = this.validateContact(contact);
        const result = [
            `<item key="${type}">`,
            '<dt_assoc>',
        ];

        Object.entries(validatedContact).forEach(([key, value]) => {
            result.push(this.createEnvelopItem(key, value));
        });

        result.push('</dt_assoc>', '</item>');

        return result.join('\n');
    }

    private createContactSet(contacts: Record<string, any>): string {
        const result = [
            '<item key="contact_set">',
            '<dt_assoc>',
        ];

        Object.entries(contacts).forEach(([type, contact]) => {
            result.push(this.createContact(type, contact));
        });

        result.push('</dt_assoc>', '</item>');

        return result.join('\n');
    }

    private createNameserver(name: string, sortOrder: number): string {
        return [
            '<dt_assoc>',
            this.createEnvelopItem('name', name),
            this.createEnvelopItem('sortorder', sortOrder),
            '</dt_assoc>',
        ].join('\n');
    }

    private createNameserverList(nameservers: string[]): string {
        const result = [
            '<item key="nameserver_list">',
            '<dt_array>',
        ];

        nameservers.forEach((name, index) => {
            result.push(this.createNameserver(name, index));
        });

        result.push('</dt_array>', '</item>');

        return result.join('\n');
    }

    private createNamespaceAssign(nameservers: string[]): string {
        const result = [
            '<item key="add_ns">',
            '<dt_array>',
        ];

        nameservers.forEach((name, index) => {
            result.push(this.createEnvelopItem(index.toString(), name));
        });

        result.push('</dt_array>', '</item>');

        return result.join('\n');
    }

    private buildEnvelop(object: string, action: string, attributes: Record<string, any>, domain: string | null = null): string {
        const result = [
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
            "<!DOCTYPE OPS_envelope SYSTEM 'ops.dtd'>",
            '<OPS_envelope>',
            '<header>',
            '<version>0.9</version>',
            '</header>',
            '<body>',
            '<data_block>',
            '<dt_assoc>',
            this.createEnvelopItem('protocol', 'XCP'),
            this.createEnvelopItem('object', object),
            this.createEnvelopItem('action', action),
            domain ? this.createEnvelopItem('domain', domain) : '',
            '<item key="attributes">',
            '<dt_assoc>',
        ];

        Object.entries(attributes).forEach(([key, value]) => {
            switch (key) {
                case 'contact_set':
                    result.push(this.createContactSet(value));
                    break;
                case 'nameserver_list':
                    result.push(this.createNameserverList(value));
                    break;
                case 'assign_ns':
                case 'add_ns':
                case 'remove_ns':
                    result.push(this.createNamespaceAssign(value));
                    break;
                default:
                    result.push(Array.isArray(value) ? this.createArray(key, value) : this.createEnvelopItem(key, value));
            }
        });

        result.push('</dt_assoc>', '</item>', '</dt_assoc>', '</data_block>', '</body>', '</OPS_envelope>');

        return result.join('\n');
    }

    private sanitizeContacts(contacts: Contact[]): Record<string, any> {
        if (contacts.length === 1) {
            const contactArray = contacts[0].toArray();
            return {
                owner: contactArray,
                admin: contactArray,
                tech: contactArray,
                billing: contactArray,
            };
        }

        const result: Record<string, any> = {};
        contacts.forEach((contact: any) => {
            result[contact.type] = contact.toArray();
        });

        return result;
    }
}