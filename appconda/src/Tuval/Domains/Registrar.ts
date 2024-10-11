import { Adapter as RegistrarAdapter } from './Registrars/Adapter';

export class Registrar {
    protected adapter: RegistrarAdapter;

    constructor(adapter: RegistrarAdapter) {
        this.adapter = adapter;
    }

    available(domain: string): Promise<boolean> {
        return this.adapter.available(domain);
    }

    purchase(domain: string, contacts: any[], nameservers: any[] = []): Promise<any[]> {
        return this.adapter.purchase(domain, contacts, nameservers);
    }

    suggest(query: any[], tlds: any[] = [], minLength: number = 1, maxLength: number = 100): Promise<any> {
        return this.adapter.suggest(query, tlds, minLength, maxLength);
    }

    tlds(): any[] {
        return this.adapter.tlds();
    }

    getDomain(domain: string): Promise<any> {
        return this.adapter.getDomain(domain);
    }

    renew(domain: string, years: number): Promise<any> {
        return this.adapter.renew(domain, years);
    }

    transfer(domain: string, contacts: any[], nameservers: any[] = []): Promise<any> {
        return this.adapter.transfer(domain, contacts, nameservers);
    }
}