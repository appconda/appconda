
export abstract class Device {
    protected transferChunkSize: number = 20000000; // 20 MB

    protected static readonly MAX_PAGE_SIZE: number = Number.MAX_SAFE_INTEGER;

    setTransferChunkSize(chunkSize: number): void {
        this.transferChunkSize = chunkSize;
    }

    getTransferChunkSize(): number {
        return this.transferChunkSize;
    }

    abstract getName(): string;

    abstract getType(): string;

    abstract getDescription(): string;

    abstract getRoot(): string;

    abstract getPath(filename: string, prefix?: string): string;

    abstract upload(source: Buffer, path: string, chunk: number, chunks?: number, metadata?: Record<string, any> ): Promise<number>;

    abstract uploadData(data: Buffer, path: string, contentType: string, chunk?: number, chunks?: number, metadata?: Record<string, any> ): Promise<number>;

    abstract abort(path: string, extra: string ): Promise<boolean>;

    abstract read(path: string, offset?: number  , length?: number): Promise<Buffer>;
    abstract readString(path: string, offset: number , length?: number): Promise<string>;

    abstract transfer(path: string, destination: string, device: Device): Promise<boolean>;

    abstract write(path: string, data: Buffer, contentType: string): Promise<boolean>;

    async move(source: string, target: string): Promise<boolean> {
        if (source === target) {
            return false;
        }

        if (await this.transfer(source, target, this)) {
            return this.delete(source);
        }

        return false;
    }

    abstract delete(path: string, recursive?: boolean ): Promise<boolean>;

    abstract deletePath(path: string): Promise<boolean>;

    abstract exists(path: string): Promise<boolean>;

    abstract getFileSize(path: string): Promise<number>;

    abstract getFileMimeType(path: string): Promise<string>;

    abstract getFileHash(path: string): Promise<string>;

    public abstract createDirectory(path: string): Promise<boolean>;

    abstract getDirectorySize(path: string): Promise<number>;

    abstract getPartitionFreeSpace(): Promise<number>;

    abstract getPartitionTotalSpace(): Promise<number>;

    abstract getFiles(dir: string, max: number , continuationToken: string): Promise<any[]>;

    getAbsolutePath(path: string): string {
        const parts = path.split(/[\/\\]/).filter(Boolean);
        const absolutes: string[] = [];

        for (const part of parts) {
            if (part === '.') {
                continue;
            }
            if (part === '..') {
                absolutes.pop();
            } else {
                absolutes.push(part);
            }
        }

        return '/' + absolutes.join('/');
    }
}
