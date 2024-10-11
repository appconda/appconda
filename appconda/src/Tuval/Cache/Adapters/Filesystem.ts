import { Adapter } from "../Adapter";
const fs = require('fs');
const path = require('path');
const glob = require('glob');

export class Filesystem implements Adapter {
    protected path: string = '';

    constructor(path: string) {
        this.path = path;
    }

    async load(key: string, ttl: number, hash: string = ''): Promise<any> {
        const file = this.getPath(key);

        if (fs.existsSync(file) && (fs.statSync(file).mtime.getTime() + ttl * 1000 > Date.now())) {
            return fs.readFileSync(file, 'utf8');
        }

        return false;
    }

    async save(key: string, data: any, hash: string = ''): Promise<boolean | string | any[]> {
        if (!data) {
            return false;
        }

        const file = this.getPath(key);
        const dir = path.dirname(file);

        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(file, data, { flag: 'w' });
            return data;
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async list(key: string): Promise<string[]> {
        return [];
    }

    async purge(key: string, hash: string = ''): Promise<boolean> {
        const file = this.getPath(key);

        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            return true;
        }

        return false;
    }

    async flush(): Promise<boolean> {
        return this.deleteDirectory(this.path);
    }

    async ping(): Promise<boolean> {
        return fs.existsSync(this.path) && fs.accessSync(this.path, fs.constants.W_OK | fs.constants.R_OK);
    }

    async getSize(): Promise<number> {
        try {
            return this.getDirectorySize(path.dirname(this.path));
        } catch {
            return 0;
        }
    }

    private getDirectorySize(dir: string): number {
        let size = 0;
        const normalizedPath = path.join(dir, '*');

        const paths = glob.sync(normalizedPath, { nodir: false });
        if (!paths) {
            return size;
        }

        for (const p of paths) {
            if (fs.statSync(p).isFile()) {
                size += fs.statSync(p).size;
            } else if (fs.statSync(p).isDirectory()) {
                size += this.getDirectorySize(p);
            }
        }

        return size;
    }

    getPath(filename: string): string {
        return path.join(this.path, filename);
    }

    protected deleteDirectory(dirPath: string): boolean {
        if (!fs.statSync(dirPath).isDirectory()) {
            throw new Error(`${dirPath} must be a directory`);
        }

        if (!dirPath.endsWith('/')) {
            dirPath += '/';
        }

        const files = glob.sync(dirPath + '*', { mark: true });

        if (!files) {
            throw new Error('Error happened during glob');
        }

        for (const file of files) {
            if (fs.statSync(file).isDirectory()) {
                this.deleteDirectory(file);
            } else {
                fs.unlinkSync(file);
            }
        }

        return fs.rmdirSync(dirPath);
    }
}