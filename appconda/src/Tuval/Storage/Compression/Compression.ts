// Compression.ts

export abstract class Compression {
    public static readonly ZSTD = 'zstd';
    public static readonly GZIP = 'gzip';
    public static readonly BROTLI = 'brotli';
    public static readonly LZ4 = 'lz4';
    public static readonly SNAPPY = 'snappy';
    public static readonly XZ = 'xz';
    public static readonly NONE = 'none';
  
    /**
     * Return the name of compression algorithm.
     *
     * @return string
     */
    abstract getName(): string;
  
    /**
     * Compress the given data.
     *
     * @param data string
     * @return Promise<Buffer> | string
     */
    abstract compress(data: string): Promise<Buffer> | string;
  
    /**
     * Decompress the given data.
     *
     * @param data Buffer | string
     * @return Promise<Buffer> | string
     */
    abstract decompress(data: Buffer | string): Promise<Buffer> | string;
  }
  
  