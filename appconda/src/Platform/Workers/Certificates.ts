// Import necessary modules
import { exec } from "child_process";
import { APP_STORAGE_CERTIFICATES } from "../../app/init";
import { Console } from "../../Tuval/CLI";
import { DateTime, Document, Exception, ID } from "../../Tuval/Core";
import { Database, Query } from "../../Tuval/Database";
import { Domain } from "../../Tuval/Domains";
import { App } from "../../Tuval/Http";
import { Locale } from "../../Tuval/Locale";
import { Log } from "../../Tuval/Logger";
import { Action } from "../../Tuval/Platform/Action";
import { Message } from "../../Tuval/Queue";
import { Event } from "../../Appconda/Event/Event";
import { Func } from "../../Appconda/Event/Func";
import { Mail } from "../../Appconda/Event/Mail";
import { Realtime } from "../../Appconda/Messaging/Adapters/Realtime";
import { CNAME } from "../../Appconda/Network/Validators/CNAME";
import { Template } from "../../Appconda/Template/Template";
import { Rule } from "../../Appconda/Tuval/Response/Models/Rule";
import * as forge from 'node-forge';
const fs = require('fs');

interface ParsedCertificate {
    subject: object;
    issuer: object;
    valid_from: string;
    valid_to: string;
    serial_number: string;
    version: number;
    signature_algorithm: string;
    extensions: object[];
}

export class Certificates extends Action {
    public static getName(): string {
        return 'certificates';
    }

    constructor() {
        super();
        this.desc('Certificates worker')
            .inject('message')
            .inject('dbForConsole')
            .inject('queueForMails')
            .inject('queueForEvents')
            .inject('queueForFunctions')
            .inject('log')
            .callback((message: Message, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log) => this.action(message, dbForConsole, queueForMails, queueForEvents, queueForFunctions, log));
    }

    public async action(message: Message, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log): Promise<void> {
        const payload = message.getPayload() ?? {};

        if (Object.keys(payload).length === 0) {
            throw new Error('Missing payload');
        }

        const document = new Document(payload['domain'] ?? {});
        const domain = new Domain(document.getAttribute('domain', ''));
        const skipRenewCheck = payload['skipRenewCheck'] ?? false;

        log.addTag('domain', domain.get());

        await this.execute(domain, dbForConsole, queueForMails, queueForEvents, queueForFunctions, log, skipRenewCheck);
    }

    private async execute(domain: Domain, dbForConsole: Database, queueForMails: Mail, queueForEvents: Event, queueForFunctions: Func, log: Log, skipRenewCheck = false): Promise<void> {
        let certificate = await dbForConsole.findOne('certificates', [Query.equal('domain', [domain.get()])]);

        if (!certificate) {
            certificate = new Document();
            certificate.setAttribute('domain', domain.get());
        }

        let success = false;

        try {
            const email = process.env._APP_EMAIL_CERTIFICATES || process.env._APP_SYSTEM_SECURITY_EMAIL_ADDRESS;
            if (!email) {
                throw new Error('You must set a valid security email address (_APP_EMAIL_CERTIFICATES) to issue an SSL certificate.');
            }

            if (!skipRenewCheck) {
                const mainDomain = this.getMainDomain();
                const isMainDomain = !mainDomain || domain.get() === mainDomain;
                await this.validateDomain(domain, isMainDomain, log);
            }

            if (!skipRenewCheck && !(await this.isRenewRequired(domain.get(), log))) {
                throw new Error('Renew isn\'t required.');
            }

            const folder = ID.unique();
            const letsEncryptData = await this.issueCertificate(folder, domain.get(), email);

            certificate.setAttribute('logs', 'Certificate successfully generated.');

            await this.applyCertificateFiles(folder, domain.get(), letsEncryptData);

            certificate.setAttribute('renewDate', await this.getRenewDate(domain.get()));
            certificate.setAttribute('attempts', 0);
            certificate.setAttribute('issueDate', DateTime.now());
            success = true;
        } catch (error) {
            const logs = (error as Error).message;

            certificate.setAttribute('logs', logs);
            const attempts = (certificate.getAttribute('attempts', 0) as number) + 1;
            certificate.setAttribute('attempts', attempts);
            certificate.setAttribute('renewDate', DateTime.now());

            await this.notifyError(domain.get(), logs, attempts, queueForMails);

            throw error;
        } finally {
            certificate.setAttribute('updated', DateTime.now());
            await this.saveCertificateDocument(domain.get(), certificate, success, dbForConsole, queueForEvents, queueForFunctions);
        }
    }

    private async saveCertificateDocument(domain: string, certificate: Document, success: boolean, dbForConsole: Database, queueForEvents: Event, queueForFunctions: Func): Promise<void> {
        let certificateDocument = await dbForConsole.findOne('certificates', [Query.equal('domain', [domain])]);
        if (certificateDocument && !certificateDocument.isEmpty()) {
            certificate = new Document({ ...certificateDocument.getArrayCopy(), ...certificate.getArrayCopy() });
            certificate = await dbForConsole.updateDocument('certificates', certificate.getId(), certificate);
        } else {
            certificate.removeAttribute('$internalId');
            certificate = await dbForConsole.createDocument('certificates', certificate);
        }

        const certificateId = certificate.getId();
        await this.updateDomainDocuments(certificateId, domain, success, dbForConsole, queueForEvents, queueForFunctions);
    }

    private getMainDomain(): string | null {
        const envDomain = process.env._APP_DOMAIN || '';
        if (envDomain && envDomain !== 'localhost') {
            return envDomain;
        }
        return null;
    }

    private async validateDomain(domain: Domain, isMainDomain: boolean, log: Log): Promise<void> {
        if (!domain.get()) {
            throw new Error('Missing certificate domain.');
        }

        if (!domain.isKnown() || domain.isTest()) {
            throw new Error('Unknown public suffix for domain.');
        }

        if (!isMainDomain) {
            const target = new Domain(process.env._APP_DOMAIN_TARGET || '');

            if (!target.isKnown() || target.isTest()) {
                throw new Error('Unreachable CNAME target (' + target.get() + '), please use a domain with a public suffix.');
            }

            const validationStart = Date.now();
            const validator = new CNAME(target.get());
            if (!(await validator.isValid(domain.get()))) {
                log.addExtra('dnsTiming', String(Date.now() - validationStart));
                log.addTag('dnsDomain', domain.get());

                const error = validator.getLogs();
                log.addExtra('dnsResponse', Array.isArray(error) ? JSON.stringify(error) : String(error));

                throw new Error('Failed to verify domain DNS records.');
            }
        }
    }

    private async isRenewRequired(domain: string, log: Log): Promise<boolean> {
        const certPath = `${process.env.APP_STORAGE_CERTIFICATES}/${domain}/cert.pem`;
        if (await this.fileExists(certPath)) {
            const certData = await this.parseCertificate(certPath);
            const validTo = certData['validTo_time_t'] ?? 0;

            if (!validTo) {
                log.addTag('certificateDomain', domain);
                throw new Error('Unable to read certificate file (cert.pem).');
            }

            const expiryInAdvance = 60 * 60 * 24 * 30;
            if (validTo - expiryInAdvance > Date.now() / 1000) {
                log.addTag('certificateDomain', domain);
                log.addExtra('certificateData', JSON.stringify(certData));
                return false;
            }
        }

        return true;
    }

    private async issueCertificate(folder: string, domain: string, email: string): Promise<{ stdout: string, stderr: string }> {
        let stdout = '';
        let stderr = '';

        const staging = (App.isProduction()) ? '' : ' --dry-run';
        const exit = await Console.execute("certbot certonly -v --webroot --noninteractive --agree-tos{$staging}"
            + " --email " + email
            + " --cert-name " + folder
            + " -w " + APP_STORAGE_CERTIFICATES
            + " -d {$domain}", '', stdout, stderr);

        // Unexpected error, usually 5XX, API limits, ...
        if (exit !== 0) {
            throw new Exception('Failed to issue a certificate with message: ' + stderr);
        }

        return {
            'stdout': stdout,
            'stderr': stderr
        }
    }

    private async getRenewDate(domain: string): Promise<string> {
        const certPath = `${process.env.APP_STORAGE_CERTIFICATES}/${domain}/cert.pem`;
        const certData = await this.parseCertificate(certPath);
        const validTo = certData['validTo_time_t'] ?? null;
        const dt = new Date(validTo * 1000);
        return DateTime.addSeconds(dt, -60 * 60 * 24 * 30).toISOString();
    }

    private async applyCertificateFiles(folder: string, domain: string, letsEncryptData: object): Promise<void> {
        const path = `${process.env.APP_STORAGE_CERTIFICATES}/${domain}`;
        if (!(await this.fileExists(path))) {
            await this.createDirectory(path);
        }
        try {
            await this.moveFile(`/etc/letsencrypt/live/${folder}/cert.pem`, `${path}/cert.pem`);
        } catch {
            throw new Exception('Failed to rename certificate cert.pem. Let\'s Encrypt log: ' + letsEncryptData['stderr'] + ' ; ' + letsEncryptData['stdout']);
        }

        await this.moveFile(`/etc/letsencrypt/live/${folder}/chain.pem`, `${path}/chain.pem`);
        await this.moveFile(`/etc/letsencrypt/live/${folder}/fullchain.pem`, `${path}/fullchain.pem`);
        await this.moveFile(`/etc/letsencrypt/live/${folder}/privkey.pem`, `${path}/privkey.pem`);

        const config = [
            "tls:",
            "  certificates:",
            `    - certFile: /storage/certificates/${domain}/fullchain.pem`,
            `      keyFile: /storage/certificates/${domain}/privkey.pem`
        ].join('\n');

        await this.writeFile(`${process.env.APP_STORAGE_CONFIG}/${domain}.yml`, config);
    }

    private async notifyError(domain: string, errorMessage: string, attempt: number, queueForMails: Mail): Promise<void> {
        Console.warning(`Cannot renew domain (${domain}) on attempt no. ${attempt} certificate: ${errorMessage}`);

        const locale = new Locale(process.env._APP_LOCALE || 'en');

        const template = Template.fromFile(`${__dirname}/../../../../app/config/locale/templates/email-certificate-failed.tpl`);
        template.setParam('{{domain}}', domain);
        template.setParam('{{error}}', errorMessage.replace(/\n/g, '<br>'));
        template.setParam('{{attempts}}', attempt.toString());
        const body = await template.render();

        const emailVariables = {
            'direction': locale.getText('settings.direction'),
        };

        const subject = locale.getText("emails.certificate.subject").replace('{{domain}}', domain);

        queueForMails
            .setSubject(subject)
            .setBody(body)
            .setName('Appconda Administrator')
            .setBodyTemplate(`${__dirname}/../../../../app/config/locale/templates/email-base-styled.tpl`)
            .setVariables(emailVariables)
            .setRecipient(process.env._APP_EMAIL_CERTIFICATES || process.env._APP_SYSTEM_SECURITY_EMAIL_ADDRESS)
            .trigger();
    }

    private async updateDomainDocuments(certificateId: string, domain: string, success: boolean, dbForConsole: Database, queueForEvents: Event, queueForFunctions: Func): Promise<void> {
        const rule = await dbForConsole.findOne('rules', [Query.equal('domain', [domain])]);

        if (rule && !rule.isEmpty()) {
            rule.setAttribute('certificateId', certificateId);
            rule.setAttribute('status', success ? 'verified' : 'unverified');
            await dbForConsole.updateDocument('rules', rule.getId(), rule);

            const projectId = rule.getAttribute('projectId');

            if (projectId === 'console') {
                return;
            }

            const project = await dbForConsole.getDocument('projects', projectId);

            const ruleModel = new Rule();
            queueForEvents
                .setProject(project)
                .setEvent('rules.[ruleId].update')
                .setParam('ruleId', rule.getId())
                .setPayload(rule.getArrayCopy(Object.keys(ruleModel.getRules())))
                .trigger();

            queueForFunctions
                .setProject(project)
                .setEvent('rules.[ruleId].update')
                .setParam('ruleId', rule.getId())
                .setPayload(rule.getArrayCopy(Object.keys(ruleModel.getRules())))
                .trigger();

            const allEvents = Event.generateEvents('rules.[ruleId].update', { 'ruleId': rule.getId() });
            const target = Realtime.fromPayload(allEvents[0], rule, project);
            Realtime.send('console', rule.getArrayCopy(), allEvents, target.channels, target.roles);
            Realtime.send(project.getId(), rule.getArrayCopy(), allEvents, target.channels, target.roles);
        }
    }

    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    private async createDirectory(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            throw new Error(`Failed to create directory: ${error.message}`);
        }
    }

    private async moveFile(src: string, dest: string): Promise<void> {
        try {
            await fs.rename(src, dest);
        } catch (error) {
            throw new Error(`Failed to move file from ${src} to ${dest}: ${error.message}`);
        }
    }

    private async writeFile(filePath: string, content: string): Promise<void> {
        try {
            await fs.writeFile(filePath, content, 'utf8');
        } catch (error) {
            throw new Error(`Failed to write file at ${filePath}: ${error.message}`);
        }
    }

    private async parseCertificate(certPath: string): Promise<any> {
        try {
            const { stdout } = await exec(`openssl x509 -in ${certPath} -noout -enddate`);
            const match = stdout.read().match(/notAfter=(.*)/);
            if (match) {
                const validTo = new Date(match[1]).getTime() / 1000;
                return { validTo_time_t: validTo };
            }
            throw new Error('Failed to parse certificate expiration date.');
        } catch (error) {
            throw new Error(`Failed to parse certificate at ${certPath}: ${error.message}`);
        }
    }


    private parseX509Certificate(certPath: string): ParsedCertificate | null {
        try {
            // Read the certificate file
            const certPem = fs.readFileSync(certPath, 'utf-8');

            // Use forge to parse the certificate
            const cert = forge.pki.certificateFromPem(certPem);

            // Extract basic information
            const parsedCert: ParsedCertificate = {
                subject: cert.subject.attributes,
                issuer: cert.issuer.attributes,
                valid_from: cert.validity.notBefore.toISOString(),
                valid_to: cert.validity.notAfter.toISOString(),
                serial_number: cert.serialNumber,
                version: cert.version,
                signature_algorithm: cert.siginfo.algorithmOid,
                extensions: cert.extensions || [],
            };

            return parsedCert;
        } catch (error) {
            console.error('Failed to parse the certificate:', error);
            return null;
        }
    }
}