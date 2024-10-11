// GZIP.ts

import { deflate, inflate } from 'pako';
import { Compression } from '../Compression';

export class GZIP extends Compression {
  /**
   * @return string
   */
  public getName(): string {
    return 'gzip';
  }

  /**
   * Compress.
   *
   * @param data
   * @returns string
   */
  public compress(data: string): string {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    return Buffer.from(deflate(encodedData)).toString('base64');
  }

  /**
   * Decompress.
   *
   * @param data
   * @returns string
   */
  public decompress(data: string | Buffer): string {
    let inputData: Uint8Array;

    if (typeof data === 'string') {
      inputData = Buffer.from(data, 'base64');
    } else {
      inputData = new Uint8Array(data);
    }

    const decompressedData = inflate(inputData);
    const decoder = new TextDecoder();
    return decoder.decode(decompressedData);
  }
}

export default GZIP;
