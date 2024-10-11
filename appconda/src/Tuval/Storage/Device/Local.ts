import { Device } from '../Device';
import { Storage } from '../Storage';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import * as crypto from 'crypto';
import * as diskusage from 'diskusage';

function readFileWithOffsetAndLength(filePath, offset = 0, length ) {
    return new Promise((resolve, reject) => {
        const buffer = Buffer.alloc(length || 1024); // Allocate a buffer to hold the file data
        const fd = fs.openSync(filePath, 'r'); // Open the file for reading

        try {
            //@ts-ignore
            const bytesRead = fs.readSync(fd, buffer, 0, length || buffer.length, offset);
            const data = buffer.toString('utf-8', 0, bytesRead); // Convert buffer to string
            resolve(buffer);
        } catch (error) {
            reject(error);
        } finally {
            fs.closeSync(fd); // Always close the file descriptor
        }
    });
}
function readFileWithOffsetAndLengthString(filePath, offset = 0, length ) {
    return new Promise((resolve, reject) => {
        const buffer = Buffer.alloc(length || 1024); // Allocate a buffer to hold the file data
        const fd = fs.openSync(filePath, 'r'); // Open the file for reading

        try {
            const bytesRead = fs.readSync(fd, buffer as any, 0, length || buffer.length, offset);
            const data = buffer.toString('utf-8', 0, bytesRead); // Convert buffer to string
            resolve(data);
        } catch (error) {
            reject(error);
        } finally {
            fs.closeSync(fd); // Always close the file descriptor
        }
    });
}

export class Local extends Device {
    protected root: string = 'temp';

    constructor(root: string = '') {
        super();
        this.root = root;
    }

    getName(): string {
        return 'Local Storage';
    }

    getType(): string {
        return Storage.DEVICE_LOCAL;
    }

    getDescription(): string {
        return 'Adapter for Local storage that is in the physical or virtual machine or mounted to it.';
    }

    getRoot(): string {
        return this.root;
    }

    getPath(filename: string, prefix: string | null = null): string {
        return this.getAbsolutePath(path.join(this.getRoot(), filename));
    }

    async upload(source: Buffer, destination: string, chunk: number = 1, chunks: number = 1, metadata: Record<string, any> = {}): Promise<number> {
        await this.createDirectory(path.dirname(destination));

        if (chunks === 1) {
            try {
                fs.renameSync(source, destination);
                return chunks;
            } catch (error) {
                throw new Error(`Can't upload file ${destination}`);
            }
        }

        const tmp = path.join(path.dirname(destination), `tmp_${path.basename(destination)}`, `${path.basename(destination)}_chunks.log`);
        await this.createDirectory(path.dirname(tmp));

        try {
            fs.appendFileSync(tmp, `${chunk}\n`);
        } catch (error) {
            throw new Error(`Can't write chunk log ${tmp}`);
        }

        const chunkLogs = fs.readFileSync(tmp, 'utf-8').split('\n').filter(Boolean);
        const chunksReceived = chunkLogs.length;

        try {
            fs.renameSync(source, path.join(path.dirname(tmp), `${path.parse(destination).name}.part.${chunk}`));
        } catch (error) {
            throw new Error(`Failed to write chunk ${chunk}`);
        }

        if (chunks === chunksReceived) {
            await this.joinChunks(destination, chunks);
            return chunksReceived;
        }

        return chunksReceived;
    }

    async uploadData(data: Buffer, destination: string, contentType: string, chunk: number = 1, chunks: number = 1, metadata: Record<string, any> = {}): Promise<number> {
        await this.createDirectory(path.dirname(destination));

        if (chunks === 1) {
            try {
                //@ts-ignore
                fs.writeFileSync(destination, data);
                return chunks;
            } catch (error) {
                throw new Error(`Can't write file ${destination}`);
            }
        }

        const tmp = path.join(path.dirname(destination), `tmp_${path.basename(destination)}`, `${path.basename(destination)}_chunks.log`);
        await this.createDirectory(path.dirname(tmp));

        try {
            fs.appendFileSync(tmp, `${chunk}\n`);
        } catch (error) {
            throw new Error(`Can't write chunk log ${tmp}`);
        }

        const chunkLogs = fs.readFileSync(tmp, 'utf-8').split('\n').filter(Boolean);
        const chunksReceived = chunkLogs.length;

        try {
            //@ts-ignore
            fs.writeFileSync(path.join(path.dirname(tmp), `${path.parse(destination).name}.part.${chunk}`), data);
        } catch (error) {
            throw new Error(`Failed to write chunk ${chunk}`);
        }

        if (chunks === chunksReceived) {
            await this.joinChunks(destination, chunks);
            return chunksReceived;
        }

        return chunksReceived;
    }

    private async joinChunks(destination: string, chunks: number): Promise<void> {
        const tmp = path.join(path.dirname(destination), `tmp_${path.basename(destination)}`, `${path.basename(destination)}_chunks.log`);
        for (let i = 1; i <= chunks; i++) {
            const part = path.join(path.dirname(tmp), `${path.parse(destination).name}.part.${i}`);
            const data = fs.readFileSync(part);
            if (!data) {
                throw new Error(`Failed to read chunk ${part}`);
            }

            //@ts-ignore
            fs.appendFileSync(destination, data);
            fs.unlinkSync(part);
        }
        fs.unlinkSync(tmp);
        fs.rmdirSync(path.dirname(tmp));
    }

    async transfer(source: string, destination: string, device: Device): Promise<boolean> {
        if (!this.exists(source)) {
            throw new Error('File Not Found');
        }
        const size = await this.getFileSize(source);
        const contentType = await this.getFileMimeType(source);

        if (size <= this.transferChunkSize) {
            const data = await this.read(source);
            return device.write(destination, data, contentType);
        }

        const totalChunks = Math.ceil(size / this.transferChunkSize);
        const metadata = { content_type: contentType };
        for (let counter = 0; counter < totalChunks; counter++) {
            const start = counter * this.transferChunkSize;
            const data = await this.read(source, start, this.transferChunkSize);
            await device.uploadData(data, destination, contentType, counter + 1, totalChunks, metadata);
        }

        return true;
    }

    async abort(destination: string, extra: string = ''): Promise<boolean> {
        if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
        }

        const tmp = path.join(path.dirname(destination), `tmp_${path.basename(destination)}`);
        if (!fs.existsSync(path.dirname(tmp))) {
            throw new Error(`File doesn't exist: ${path.dirname(destination)}`);
        }

        const files = await this.getFiles(tmp);
        for (const file of files) {
            this.delete(file, true);
        }

        fs.rmdirSync(tmp);
        return true;
    }

    async read(filePath: string, offset: number = 0, length: number | null = null): Promise<Buffer> {
        if (!this.exists(filePath)) {
            throw new Error('File Not Found');
        }

        const data = readFileWithOffsetAndLength(filePath, offset, length ? offset + length - 1 : null );
        return data as any;
    }

    async readString(filePath: string, offset: number = 0, length: number | null = null): Promise<string> {
        if (!this.exists(filePath)) {
            throw new Error('File Not Found');
        }

        const data = readFileWithOffsetAndLengthString(filePath, offset, length ? offset + length - 1 : null );
        return data as any;
    }

    async write(filePath: string, data: string | Buffer, contentType: string = ''): Promise<boolean> {

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        try {
            //@ts-ignore
            fs.writeFileSync(filePath, data);
            return true;
        } catch (error) {
            return false;
        }
    }
    

    async move(source: string, target: string): Promise<boolean> {
        if (source === target) {
            return false;
        }

        const dir = path.dirname(target);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        try {
            fs.renameSync(source, target);
            return true;
        } catch (error) {
            return false;
        }
    }

    async delete(filePath: string, recursive: boolean = false): Promise<boolean> {
        if (fs.lstatSync(filePath).isDirectory() && recursive) {
            const files = await this.getFiles(filePath);
            for (const file of files) {
                this.delete(file, true);
            }
            fs.rmdirSync(filePath);
        } else if (fs.lstatSync(filePath).isFile() || fs.lstatSync(filePath).isSymbolicLink()) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }

    async deletePath(filePath: string): Promise<boolean> {
        const resolvedPath = path.resolve(this.getRoot(), filePath);

        if (!fs.existsSync(resolvedPath) || !fs.lstatSync(resolvedPath).isDirectory()) {
            return false;
        }

        const files = await this.getFiles(resolvedPath);
        for (const file of files) {
            if (fs.lstatSync(file).isDirectory()) {
                this.deletePath(path.relative(this.getRoot(), file));
            } else {
                this.delete(file, true);
            }
        }

        fs.rmdirSync(resolvedPath);
        return true;
    }

    async exists(filePath: string): Promise<boolean> {
        return fs.existsSync(filePath);
    }

    async getFileSize(filePath: string): Promise<number> {
        return fs.statSync(filePath).size;
    }

    async getFileMimeType(filePath: string): Promise<string> {
        const mimeType = mime.lookup(filePath);
        if (!mimeType) {
            throw new Error('Unable to determine MIME type');
        }
        return mimeType;
    }

    async getFileHash(filePath: string): Promise<string> {
        const hash = crypto.createHash('md5');
        const data = fs.readFileSync(filePath);
        //@ts-ignore
        hash.update(data);
        return hash.digest('hex');
    }

    async createDirectory(dirPath: string): Promise<boolean> {
        console.log('createDirectory', dirPath);
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getDirectorySize(dirPath: string): Promise<number> {
        let size = 0;

        const directory = fs.opendirSync(dirPath);
        let dirent;
        while ((dirent = directory.readSync()) !== null) {
            if (dirent.name.startsWith('.')) {
                continue;
            }

            const fullPath = path.join(dirPath, dirent.name);
            if (dirent.isDirectory()) {
                size += await this.getDirectorySize(fullPath);
            } else {
                size += fs.statSync(fullPath).size;
            }
        }
        directory.closeSync();

        return size;
    }

    async getPartitionFreeSpace(): Promise<number> {
        const { free } = diskusage.checkSync(this.getRoot());
        return free;
    }

    async getPartitionTotalSpace(): Promise<number> {
        const { total } = diskusage.checkSync(this.getRoot());
        return total;
    }

    async getFiles(dir: string, max: number = Local.MAX_PAGE_SIZE, continuationToken: string = ''): Promise<string[]> {
        const files: string[] = [];

        const allFiles = fs.readdirSync(dir);
        for (const file of allFiles) {
            files.push(path.join(dir, file));
        }

        return files;
    }
}