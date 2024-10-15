import { Console } from "../../Tuval/CLI";
import { Boolean, Document, Hostname } from "../../Tuval/Core";
import { Action } from "../../Tuval/Platform/Action";
import { Certificate } from "../../Appconda/Event/Certificate";


export class SSL extends Action {
    public static getName(): string {
        return 'ssl';
    }

    constructor() {
        super();
        this.desc('Validate server certificates')
            .param('domain', process.env._APP_DOMAIN || '', new Hostname(), 'Domain to generate certificate for. If empty, main domain will be used.', true)
            .param('skip-check', true, new Boolean(true), 'If DNS and renew check should be skipped. Defaults to true, and when true, all jobs will result in certificate generation attempt.', true)
            .inject('queueForCertificates')
            .callback((domain: string, skipCheck: boolean | string, queueForCertificates: Certificate) => this.action(domain, skipCheck, queueForCertificates));
    }

    public action(domain: string, skipCheck: boolean | string, queueForCertificates: Certificate): void {
        skipCheck = String(skipCheck) === 'true';

        Console.success('Scheduling a job to issue a TLS certificate for domain: ' + domain);

        queueForCertificates
            .setDomain(new Document({
                domain: domain
            }))
            .setSkipRenewCheck(skipCheck)
            .trigger();
    }
}