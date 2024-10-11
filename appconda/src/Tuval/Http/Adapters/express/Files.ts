// Öncelikle gerekli npm paketlerini yükleyin
// npm install mime

import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

export class Files {
    private static loaded: { [key: string]: { contents: string, mimeType: string } } = {};
    private static count: number = 0;
    private static mimeTypes: { [key: string]: boolean } = {};

    public static readonly EXTENSIONS: { [key: string]: string } = {
        'css': 'text/css',
        'js': 'text/javascript',
        'svg': 'image/svg+xml',
    };

    public static addMimeType(mimeType: string): void {
        this.mimeTypes[mimeType] = true;
    }

    public static removeMimeType(mimeType: string): void {
        if (this.mimeTypes[mimeType]) {
            delete this.mimeTypes[mimeType];
        }
    }

    public static getMimeTypes(): { [key: string]: boolean } {
        return this.mimeTypes;
    }

    public static getCount(): number {
        return this.count;
    }

    public static load(directory: string, root: string | null = null): void {
        if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
            throw new Error(`Failed to load directory: ${directory}`);
        }

        directory = fs.realpathSync(directory);
        root = root || directory;

        const handle = fs.opendirSync(directory);
        let dirent;

        while ((dirent = handle.readSync()) !== null) {
            const extension = path.extname(dirent.name).substring(1);

            if (dirent.name === '.' || dirent.name === '..') {
                continue;
            }

            if (['php', 'phtml'].includes(extension)) {
                continue;
            }

            if (dirent.name.startsWith('.')) {
                continue;
            }

            const dirPath = path.join(directory, dirent.name);

            if (dirent.isDirectory()) {
                this.load(dirPath, root);
                continue;
            }

            const key = dirPath.substring(root.length);

            if (this.loaded[key]) {
                continue;
            }

            this.loaded[key] = {
                contents: fs.readFileSync(dirPath, 'utf-8'),
                mimeType: this.EXTENSIONS[extension] || mime.lookup(dirPath) || 'application/octet-stream',
            };

            this.count++;
        }

        handle.closeSync();
    }

    public static isFileLoaded(uri: string): boolean {
        return !!this.loaded[uri];
    }

    public static getFileContents(uri: string): string {
        if (!this.loaded[uri]) {
            throw new Error(`File not found or not loaded: ${uri}`);
        }

        return this.loaded[uri].contents;
    }

    public static getFileMimeType(uri: string): string {
        if (!this.loaded[uri]) {
            throw new Error(`File not found or not loaded: ${uri}`);
        }

        return this.loaded[uri].mimeType;
    }

    public static reset(): void {
        this.count = 0;
        this.loaded = {};
        this.mimeTypes = {};
    }
}