import { Compression } from '../Compression';

export class Zstd extends Compression {
    protected level: number = 3;

    constructor(level: number = 3) {
        super();
        this.setLevel(level);
    }

    /**
     * Get the compression level.
     *
     * @return number
     */
    getLevel(): number {
        return this.level;
    }

    /**
     * Set the compression level.
     *
     * Allow values from 1 up to a current max of 22.
     *
     * @param level
     * @return void
     */
    setLevel(level: number): void {
        if (level < 1 || level > 22) {
            throw new Error('Level must be between 1 and 22');
        }
        this.level = level;
    }

    /**
     * Get the name of the algorithm.
     *
     * @return string
     */
    getName(): string {
        return 'zstd';
    }

    /**
     * Compress.
     *
     * @param data
     * @return string
     */
    compress(data: string): string {
        // Assuming a zstd library is available in the environment
        const zstd = require('zstd-codec').ZstdCodec;
        return zstd.compress(data, this.level);
    }

    /**
     * Decompress.
     *
     * @param data
     * @return string
     */
    decompress(data: string): string {
        // Assuming a zstd library is available in the environment
        const zstd = require('zstd-codec').ZstdCodec;
        return zstd.decompress(data);
    }
}