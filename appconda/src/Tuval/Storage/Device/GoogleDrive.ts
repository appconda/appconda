import { Device } from '../Device';
import { Storage } from '../Storage';
import { google, drive_v3 } from 'googleapis';
import * as mime from 'mime-types';
import * as crypto from 'crypto';

import * as path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

function authorize(): drive_v3.Drive {
    // TODO: Replace with your OAuth2 credentials
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // TODO: Set the credentials, possibly from a token storage
    oAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return google.drive({ version: 'v3', auth: oAuth2Client });
}

export class GoogleDrive extends Device {
    protected root: string = 'root';
    private drive: drive_v3.Drive;

    constructor(root: string = 'root') {
        super();
        this.root = root;
        this.drive = authorize();
    }

    getName(): string {
        return 'Google Drive';
    }

    getType(): string {
        return Storage.DEVICE_GOOGLE_DRIVE;
    }

    getDescription(): string {
        return 'Adapter for Google Drive storage.';
    }

    getRoot(): string {
        return this.root;
    }

    getPath(filename: string, prefix: string | null = null): string {
        return path.join(this.getRoot(), filename);
    }

    async upload(source: Buffer, destination: string, chunk: number = 1, chunks: number = 1, metadata: Record<string, any> = {}): Promise<number> {
        if (chunks === 1) {
            try {
                await this.drive.files.create({
                    requestBody: {
                        name: destination,
                        parents: [this.root],
                        ...metadata,
                    },
                    media: {
                        mimeType: metadata.content_type || mime.lookup(destination) || undefined,
                        body: Buffer.from(source),
                    },
                });
                return chunks;
            } catch (error) {
                throw new Error(`Can't upload file ${destination}: ${error}`);
            }
        }

        // Handle chunked uploads if necessary
        // Google Drive API supports resumable uploads which can be implemented here
        throw new Error('Chunked uploads are not implemented yet.');
    }

    async uploadData(data: Buffer, destination: string, contentType: string, chunk: number = 1, chunks: number = 1, metadata: Record<string, any> = {}): Promise<number> {
        return this.upload(data, destination, chunk, chunks, { ...metadata, content_type: contentType });
    }

    private async joinChunks(destination: string, chunks: number): Promise<void> {
        // Google Drive handles file uploads differently; no need to join chunks manually
        // Implement resumable uploads if handling large files
    }

    async transfer(source: string, destination: string, device: Device): Promise<boolean> {
        if (!await this.exists(source)) {
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
        // Implement abort logic if using resumable uploads
        throw new Error('Abort operation is not implemented.');
    }

    async read(filePath: string, offset: number = 0, length: number | null = null): Promise<Buffer> {
        try {
            const res = await this.drive.files.get(
                { fileId: filePath, alt: 'media' },
                { responseType: 'arraybuffer' }
            );
            const buffer = Buffer.from(res.data as ArrayBuffer);
            if (length !== null) {
                return buffer.slice(offset, offset + length);
            }
            return buffer;
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
    }

    async readString(filePath: string, offset: number = 0, length: number | null = null): Promise<string> {
        const buffer = await this.read(filePath, offset, length);
        return buffer.toString('utf-8');
    }

    async write(filePath: string, data: string | Buffer, contentType: string = ''): Promise<boolean> {
        try {
            await this.drive.files.update({
                fileId: filePath,
                media: {
                    mimeType: contentType || mime.lookup(filePath) || undefined,
                    body: Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8'),
                },
            });
            return true;
        } catch (error) {
            console.error(`Failed to write file ${filePath}:`, error);
            return false;
        }
    }

    async move(source: string, target: string): Promise<boolean> {
        try {
            // Retrieve the file
            const file = await this.drive.files.get({ fileId: source, fields: 'parents' });
            const previousParents = file.data.parents?.join(',') || '';

            // Move the file to the new parent
            await this.drive.files.update({
                fileId: source,
                addParents: path.dirname(target),
                removeParents: previousParents,
                fields: 'id, parents',
            });
            return true;
        } catch (error) {
            console.error(`Failed to move file from ${source} to ${target}:`, error);
            return false;
        }
    }

    async delete(filePath: string, recursive: boolean = false): Promise<boolean> {
        try {
            await this.drive.files.delete({ fileId: filePath });
            return true;
        } catch (error) {
            console.error(`Failed to delete file ${filePath}:`, error);
            return false;
        }
    }

    async deletePath(filePath: string): Promise<boolean> {
        try {
            // List all files in the directory
            const res = await this.drive.files.list({
                q: `'${filePath}' in parents`,
                fields: 'files(id, mimeType)',
            });

            const files = res.data.files || [];
            for (const file of files) {
                if (file.mimeType === 'application/vnd.google-apps.folder') {
                    await this.deletePath(file.id!);
                } else {
                    await this.delete(file.id!);
                }
            }

            // Delete the folder itself
            await this.delete(filePath);
            return true;
        } catch (error) {
            console.error(`Failed to delete path ${filePath}:`, error);
            return false;
        }
    }

    async exists(filePath: string): Promise<boolean> {
        try {
            await this.drive.files.get({ fileId: filePath });
            return true;
        } catch (error) {
            return false;
        }
    }

    async getFileSize(filePath: string): Promise<number> {
        try {
            const res = await this.drive.files.get({
                fileId: filePath,
                fields: 'size',
            });
            return parseInt(res.data.size || '0', 10);
        } catch (error) {
            throw new Error(`Failed to get size for file ${filePath}: ${error}`);
        }
    }

    async getFileMimeType(filePath: string): Promise<string> {
        try {
            const res = await this.drive.files.get({
                fileId: filePath,
                fields: 'mimeType',
            });
            if (!res.data.mimeType) {
                throw new Error('Unable to determine MIME type');
            }
            return res.data.mimeType;
        } catch (error) {
            throw new Error(`Failed to get MIME type for file ${filePath}: ${error}`);
        }
    }

    async getFileHash(filePath: string): Promise<string> {
        try {
            const res = await this.drive.files.get({
                fileId: filePath,
                fields: 'md5Checksum',
            });
            if (!res.data.md5Checksum) {
                throw new Error('MD5 checksum not available');
            }
            return res.data.md5Checksum;
        } catch (error) {
            throw new Error(`Failed to get hash for file ${filePath}: ${error}`);
        }
    }

    async createDirectory(dirPath: string): Promise<boolean> {
        try {
            const fileMetadata = {
                name: path.basename(dirPath),
                mimeType: 'application/vnd.google-apps.folder',
                parents: [path.dirname(dirPath)],
            };
            await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            return true;
        } catch (error) {
            console.error(`Failed to create directory ${dirPath}:`, error);
            return false;
        }
    }

    async getDirectorySize(dirPath: string): Promise<number> {
        try {
            const res = await this.drive.files.list({
                q: `'${dirPath}' in parents and trashed = false`,
                fields: 'files(size)',
            });

            const files = res.data.files || [];
            let size = 0;
            for (const file of files) {
                size += parseInt(file.size || '0', 10);
            }
            return size;
        } catch (error) {
            throw new Error(`Failed to get directory size for ${dirPath}: ${error}`);
        }
    }

    async getPartitionFreeSpace(): Promise<number> {
        // Google Drive doesn't provide partition space information
        throw new Error('Partition space information is not available for Google Drive.');
    }

    async getPartitionTotalSpace(): Promise<number> {
        // Google Drive doesn't provide partition space information
        throw new Error('Partition space information is not available for Google Drive.');
    }

    async getFiles(dir: string, max: number = GoogleDrive.MAX_PAGE_SIZE, continuationToken: string = ''): Promise<string[]> {
        try {
            const res = await this.drive.files.list({
                q: `'${dir}' in parents and trashed = false`,
                pageSize: max,
                fields: 'files(id, name)',
                pageToken: continuationToken || undefined,
            });

            const files = (res.data.files || []).map(file => file.id!);
            return files;
        } catch (error) {
            throw new Error(`Failed to list files in directory ${dir}: ${error}`);
        }
    }

    static MAX_PAGE_SIZE = 1000; // Adjust as needed
}