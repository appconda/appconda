import { Client, UploadProgress } from '../client';
import type { Models } from '../models';
import { Compression } from '../enums/compression';
import { ImageGravity } from '../enums/image-gravity';
import { ImageFormat } from '../enums/image-format';
import { StorageUsageRange } from '../enums/storage-usage-range';
export declare class Storage {
    client: Client;
    constructor(client: Client);
    /**
     * List buckets
     *
     * Get a list of all the storage buckets. You can use the query params to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise<Models.BucketList>}
     */
    listBuckets(queries?: string[], search?: string): Promise<Models.BucketList>;
    /**
     * Create bucket
     *
     * Create a new storage bucket.
     *
     * @param {string} bucketId
     * @param {string} name
     * @param {string[]} permissions
     * @param {boolean} fileSecurity
     * @param {boolean} enabled
     * @param {number} maximumFileSize
     * @param {string[]} allowedFileExtensions
     * @param {Compression} compression
     * @param {boolean} encryption
     * @param {boolean} antivirus
     * @throws {AppcondaException}
     * @returns {Promise<Models.Bucket>}
     */
    createBucket(bucketId: string, name: string, permissions?: string[], fileSecurity?: boolean, enabled?: boolean, maximumFileSize?: number, allowedFileExtensions?: string[], compression?: Compression, encryption?: boolean, antivirus?: boolean): Promise<Models.Bucket>;
    /**
     * Get bucket
     *
     * Get a storage bucket by its unique ID. This endpoint response returns a JSON object with the storage bucket metadata.
     *
     * @param {string} bucketId
     * @throws {AppcondaException}
     * @returns {Promise<Models.Bucket>}
     */
    getBucket(bucketId: string): Promise<Models.Bucket>;
    /**
     * Update bucket
     *
     * Update a storage bucket by its unique ID.
     *
     * @param {string} bucketId
     * @param {string} name
     * @param {string[]} permissions
     * @param {boolean} fileSecurity
     * @param {boolean} enabled
     * @param {number} maximumFileSize
     * @param {string[]} allowedFileExtensions
     * @param {Compression} compression
     * @param {boolean} encryption
     * @param {boolean} antivirus
     * @throws {AppcondaException}
     * @returns {Promise<Models.Bucket>}
     */
    updateBucket(bucketId: string, name: string, permissions?: string[], fileSecurity?: boolean, enabled?: boolean, maximumFileSize?: number, allowedFileExtensions?: string[], compression?: Compression, encryption?: boolean, antivirus?: boolean): Promise<Models.Bucket>;
    /**
     * Delete bucket
     *
     * Delete a storage bucket by its unique ID.
     *
     * @param {string} bucketId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteBucket(bucketId: string): Promise<{}>;
    /**
     * List files
     *
     * Get a list of all the user files. You can use the query params to filter your results.
     *
     * @param {string} bucketId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise<Models.FileList>}
     */
    listFiles(bucketId: string, queries?: string[], search?: string): Promise<Models.FileList>;
    /**
     * Create file
     *
     * Create a new file. Before using this route, you should create a new bucket resource using either a [server integration](https://appconda.io/docs/server/storage#storageCreateBucket) API or directly from your Appconda console.

Larger files should be uploaded using multiple requests with the [content-range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range) header to send a partial request with a maximum supported chunk of `5MB`. The `content-range` header values should always be in bytes.

When the first request is sent, the server will return the **File** object, and the subsequent part request must include the file&#039;s **id** in `x-appconda-id` header to allow the server to know that the partial upload is for the existing file and not for a new one.

If you&#039;re creating a new file using one of the Appconda SDKs, all the chunking logic will be managed by the SDK internally.

     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {File} file
     * @param {string[]} permissions
     * @throws {AppcondaException}
     * @returns {Promise<Models.File>}
     */
    createFile(bucketId: string, fileId: string, file: File, permissions?: string[], onProgress?: (progress: UploadProgress) => void): Promise<Models.File>;
    /**
     * Get file
     *
     * Get a file by its unique ID. This endpoint response returns a JSON object with the file metadata.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {Promise<Models.File>}
     */
    getFile(bucketId: string, fileId: string): Promise<Models.File>;
    /**
     * Update file
     *
     * Update a file by its unique ID. Only users with write permissions have access to update this resource.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {string} name
     * @param {string[]} permissions
     * @throws {AppcondaException}
     * @returns {Promise<Models.File>}
     */
    updateFile(bucketId: string, fileId: string, name?: string, permissions?: string[]): Promise<Models.File>;
    /**
     * Delete File
     *
     * Delete a file by its unique ID. Only users with write permissions have access to delete this resource.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {Promise<{}>}
     */
    deleteFile(bucketId: string, fileId: string): Promise<{}>;
    /**
     * Get file for download
     *
     * Get a file content by its unique ID. The endpoint response return with a &#039;Content-Disposition: attachment&#039; header that tells the browser to start downloading the file to user downloads directory.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {string}
     */
    getFileDownload(bucketId: string, fileId: string): string;
    /**
     * Get file preview
     *
     * Get a file preview image. Currently, this method supports preview for image files (jpg, png, and gif), other supported formats, like pdf, docs, slides, and spreadsheets, will return the file icon image. You can also pass query string arguments for cutting and resizing your preview image. Preview is supported only for image files smaller than 10MB.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {number} width
     * @param {number} height
     * @param {ImageGravity} gravity
     * @param {number} quality
     * @param {number} borderWidth
     * @param {string} borderColor
     * @param {number} borderRadius
     * @param {number} opacity
     * @param {number} rotation
     * @param {string} background
     * @param {ImageFormat} output
     * @throws {AppcondaException}
     * @returns {string}
     */
    getFilePreview(bucketId: string, fileId: string, width?: number, height?: number, gravity?: ImageGravity, quality?: number, borderWidth?: number, borderColor?: string, borderRadius?: number, opacity?: number, rotation?: number, background?: string, output?: ImageFormat): string;
    /**
     * Get file for view
     *
     * Get a file content by its unique ID. This endpoint is similar to the download method but returns with no  &#039;Content-Disposition: attachment&#039; header.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {string}
     */
    getFileView(bucketId: string, fileId: string): string;
    /**
     * Get storage usage stats
     *
     *
     * @param {StorageUsageRange} range
     * @throws {AppcondaException}
     * @returns {Promise<Models.UsageStorage>}
     */
    getUsage(range?: StorageUsageRange): Promise<Models.UsageStorage>;
    /**
     * Get bucket usage stats
     *
     *
     * @param {string} bucketId
     * @param {StorageUsageRange} range
     * @throws {AppcondaException}
     * @returns {Promise<Models.UsageBuckets>}
     */
    getBucketUsage(bucketId: string, range?: StorageUsageRange): Promise<Models.UsageBuckets>;
}
