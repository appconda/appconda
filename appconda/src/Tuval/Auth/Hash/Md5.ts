import * as crypto from 'crypto';
import { Hash } from '../Hash';

export class Md5 extends Hash{
    /**
     * Hash the input password
     * @param password Input password to hash
     * @returns string hash
     */
    public async hash(password: string): Promise<string> {
        return crypto.createHash('md5').update(password).digest('hex');
    }

    /**
     * Verify the input password against the hash
     * @param password Input password to validate
     * @param hash Hash to verify password against
     * @returns boolean true if password matches hash
     */
    public async verify(password: string, hash: string): Promise<boolean> {
        return await this.hash(password) === hash;
    }

    /**
     * Get default options for specific hashing algo
     * @returns {} options object
     */
    public async getDefaultOptions(): Promise<{}> {
        return {};
    }
}