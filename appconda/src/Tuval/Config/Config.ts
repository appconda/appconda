import { Exception } from "../../Tuval/Core";

export class Config {
    private static params: { [key: string]: any } = {};

    /**
     * Load config file
     * 
     * @throws Error
     * 
     * @return void
     */
    public static load(key: string, path: string): void {
        const fs = require('fs');
        if (!fs.existsSync(path + '.ts') || !fs.lstatSync(path + '.ts').isFile()) {
            throw new Exception('Failed to load configuration file: ' + path);
        }

        const a = require(path);
        this.params[key] = a.default;
    }

    /**
     * @param key string
     * @param value any
     *
     * @return void
     */
    public static setParam(key: string, value: any): void {
        this.params[key] = value;
    }

    /**
     * @param key string
     * @param defaultValue any
     *
     * @return any
     */
    public static getParam(key: string, defaultValue: any = null): any {
        const keys = key.split('.');
        let value: any = defaultValue;
        let node = this.params;

        while (keys.length > 0) {
            const path = keys.shift();
            if (path && node.hasOwnProperty(path)) {
                value = node[path];
                if (typeof value === 'object' && !Array.isArray(value)) {
                    node = value;
                }
            } else {
                return defaultValue;
            }
        }

        return value;
    }
}
