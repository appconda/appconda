import e from "express";
import { BaseComponent } from "../../BaseComponent";
import { Container } from "../../Container";

import express from "express";
import { Services } from "../../Services";
import HttpService from "./http-service";
import IDService from "./id-service/service";
import KVService from "./kv-service/KVService";
import { AppcondaServicePlatform } from "../Appconda";
import { register } from "../../app/init";
import { ServiceActionExecuter } from "./ServiceActionExecuter";


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

    private _platform: AppcondaServicePlatform;
    public get platform(): AppcondaServicePlatform {
        if (this._platform == null) {
            this._platform = register.get('service-platform');
        }
        return this._platform;
    }
    //@ts-ignore
    router: e.Router;
    args: any;
    service_name: any;
    services: Container;
    components: BaseComponent[] = [];
    contructed: any;
    actions: string[] = [];
    private initialized: boolean = false;

    abstract get uid(): string;
    //abstract get displayName(): string;

    async getConnector(): Promise<any> {
        return null;
    }

    getAction(action: string): ServiceActionExecuter {
        return this.platform.getServiceAction(this.uid, action);
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

    public init() { }


    async __on(id: string, args: any[]) {
        const handler = this.__get_event_handler(id);

        return await handler(id, args);
    }

    private __get_event_handler(id: string) {
        return (this as any)[`__on_${id}`]?.bind?.(this)
            || (this as any).constructor[`__on_${id}`]?.bind?.(this.constructor)
            || NOOP;
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


    public get webServer(): HttpService {
        return this.services.get('com.realmocean.service.web');
    }

    public get idService(): IDService {
        return this.services.get(Services.ID);
    }


}



