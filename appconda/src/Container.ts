import { BaseService } from "./BaseService";
import { ComponentsContainer } from "./ComponentsContainer";

const { CompositeError } = require("./utils/errorutil")
const { TeePromise } = require("./utils/promise");
const config = require("./config");


// 17 lines of code instead of an entire dependency-injection framework
export class Container {
    instances_: any;
    ready: any;
    logger: any;
    componentsContainer: ComponentsContainer;
    constructor(componentsContainer) {
        this.componentsContainer = componentsContainer;
        this.instances_ = {};
        this.ready = new TeePromise();
    }
    registerService( cls: any, args?: any) {
        const name = null;
        const my_config = /* config.services?.[name] || */ {};
        const inst = cls.getInstance
            ? cls.getInstance({ services: this, config, my_config, name, args })
            : new cls({ services: this, config, my_config, name, args });

        this.instances_[inst.uid] = inst;

    }
    set(name: any, instance: any) { this.instances_[name] = instance; }
    get(name: string, opts?: any) {
        if (this.instances_[name]) {
            return this.instances_[name];
        }
        if (!opts?.optional) {
            throw new Error(`missing service: ${name}`);
        }
    }
    has(name: string) { return !!this.instances_[name]; }
    get values() {
        const values: any = {};
        for (const k in this.instances_) {
            let k2 = k;

            // Replace lowerCamelCase with underscores
            // (just an idea; more effort than it's worth right now)
            // let k2 = k.replace(/([a-z])([A-Z])/g, '$1_$2')

            // Replace dashes with underscores
            k2 = k2.replace(/-/g, '_');
            // Convert to lower case
            k2 = k2.toLowerCase();

            values[k2] = this.instances_[k];
        }
        return this.instances_;
    }

    async init() {
        for (const k in this.instances_) {
            if (this.instances_[k] instanceof BaseService) {
                //console.log(`constructing ${k}`);
                //try {
                    await this.instances_[k].construct();
               /*  } catch (e) {
                    console.log(e);
                } */
            } else {
                console.log(`not base`);
            }
        }

        const init_failures: any = [];
        for (const k in this.instances_) {
            if (this.instances_[k] instanceof BaseService) {
                //console.log(`initializing ${k}`);
                try {
                    await this.instances_[k].init();
                } catch (e) {
                    init_failures.push({ k, e });
                }
            }
        }

        if (init_failures.length) {
            console.error('init failures', init_failures);
            /* throw new CompositeError(
                `failed to initialize these services: ` +
                init_failures.map(({ k }) => k).join(', '),
                init_failures.map(({ k, e }) => e)
            ); */
        }



    }

    async emit(id: string, ...args: any[]) {
        if (this.logger) {
            this.logger.noticeme(`services:event ${id}`, { args });
        }
        const promises: any = [];
        for (const k in this.instances_) {
            if (this.instances_[k].__on) {
                promises.push(this.instances_[k].__on(id, ...args));
            }
        }
        await Promise.all(promises);
    }
}

export class ProxyContainer {
    delegate: any;
    instances_: any;
    constructor(delegate: any) {
        this.delegate = delegate;
        this.instances_ = {};
    }
    set(name: any, instance: any) {
        this.instances_[name] = instance;
    }
    get(name: string) {
        if (this.instances_.hasOwnProperty(name)) {
            return this.instances_[name];
        }
        return this.delegate.get(name);
    }
    has(name: string) {
        if (this.instances_.hasOwnProperty(name)) {
            return true;
        }
        return this.delegate.has(name);
    }
    get values() {
        const values: any = {};
        Object.assign(values, this.delegate.values);
        for (const k in this.instances_) {
            let k2 = k;

            // Replace lowerCamelCase with underscores
            // (just an idea; more effort than it's worth right now)
            // let k2 = k.replace(/([a-z])([A-Z])/g, '$1_$2')

            // Replace dashes with underscores
            k2 = k2.replace(/-/g, '_');
            // Convert to lower case
            k2 = k2.toLowerCase();

            values[k2] = this.instances_[k];
        }
        return values;
    }
}
