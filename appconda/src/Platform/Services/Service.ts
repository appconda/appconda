import e from "express";
import { BaseComponent } from "../../BaseComponent";
import { Container } from "../../Container";

import express from "express";
import { Services } from "../../Services";
import WebServerService from "./http-service";
import DatabaseService from "./database-service/service.";
import SchemaService from "./SchemaService";
import CspService from "./CSPService";
import EmailService from "./EmailService";
import EncryptionService from "./EncryptionService";
import FlowService from "./FlowService";
import IDService from "./id-service/service";
import JiraService from "./JiraService";
import KVService from "./kv-service/KVService";
import ScheduleService from "./ScheduleService";
import SmsService from "./SMSService";

const crypto = require('crypto');


const algorithm = 'aes-256-ctr';
const key = Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex'); // 32 byte'lık anahtar
const iv = Buffer.from('101112131415161718191a1b1c1d1e1f', 'hex'); // 16 byte'lık IV


function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}


const NOOP = async () => { };

export abstract class Service {
    //@ts-ignore
    router: e.Router;
    args: any;
    service_name: any;
    services: Container;
    components: BaseComponent[] = [];
    contructed: any;
    actions: string[] = [];

    abstract get uid(): string;
    abstract get displayName(): string;

    async getConnector(): Promise<any> {
        return null;
    }

    constructor(service_resources: any, ...a: any[]) {
        const { services, config, my_config, name, args } = service_resources;
       

        this.args = args;
        this.service_name = name || this.constructor.name;
        this.services = services;
       
    }

    async describe() {
        return {};
    }

    async construct() {
        if (!this.contructed) {
            this.contructed = true;
            await ((this as any)._construct || NOOP).call(this, this.args);
        }
    }

    async init() {
        if (!(this as any).initialized) {
            (this as any).initialized = true;
            await ((this as any)._init || NOOP).call(this, this.args);
        }
    }

    async setupRouter() {
     
    }

    async __on(id: string, args: any[]) {
        const handler = this.__get_event_handler(id);

        return await handler(id, args);
    }

    __get_event_handler(id: string) {
        return (this as any)[`__on_${id}`]?.bind?.(this)
            || (this as any).constructor[`__on_${id}`]?.bind?.(this.constructor)
            || NOOP;
    }

    getRouter() {
        if (this.router == null) {
            const app = this.webServer.getExpressApp();
            this.router = express.Router();
            app.use(`/v1/service/${this.uid}`, this.router)
        }

        return this.router;

    }
    protected createKeyInternal(data: object) {
        
        return encrypt(JSON.stringify(data));
    }

    protected decodeKey(accessKey: string) {
        const data = decrypt(accessKey);
        return JSON.parse(data);
    }

    public addComponent(component: any) {
        this.components.push(component);
    }


    public get webServer(): WebServerService {
        return this.services.get('com.realmocean.service.web');
    }

    public get databaseService(): DatabaseService {
        return this.services.get('com.realmocean.service.database');
    }

    public get schemaService(): SchemaService {
        return this.services.get('com.realmocean.service.schema');
    }
    public get kvService(): KVService {
        return this.services.get('com.realmocean.service.kv');
    }

    public get emailService(): EmailService {
        return this.services.get('com.realmocean.service.email');
    }

    public get smsService(): SmsService {
        return this.services.get('com.realmocean.service.sms');
    }

    public get scheduleService(): ScheduleService {
        return this.services.get('com.realmocean.service.schedule');
    }

    public get jiraService(): JiraService {
        return this.services.get('com.realmocean.service.schedule');
    }

    public get encryptionService(): EncryptionService {
        return this.services.get('com.realmocean.service.encryption');
    }

    public get cspService(): CspService {
        return this.services.get('com.realmocean.service.csp');
    }

    public get miningService(): CspService {
        return this.services.get(Services.Mining);
    }

    public get flowService(): FlowService {
        return this.services.get(Services.Flow);
    }

    public get idService(): IDService {
        return this.services.get(Services.ID);
    }


}



