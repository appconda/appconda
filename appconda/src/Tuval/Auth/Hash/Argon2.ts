import * as argon2 from 'argon2';

export class Argon2 {
    /**
     * Hash the input password
     * @param password Input password to hash
     * @returns Promise<string> hash
     */
    public async hash(password: string): Promise<string> {
        return await argon2.hash(password, this.getOptions());
    }

    /**
     * Verify the input password against the hash
     * @param password Input password to validate
     * @param hash Hash to verify password against
     * @returns Promise<boolean> true if password matches hash
     */
    public async verify(password: string, hash: string): Promise<boolean> {
        return await argon2.verify(hash, password);
    }

    /**
     * Get default options for specific hashing algo
     * @returns argon2.Options options object
     */
    public getDefaultOptions(): argon2.Options {
        return { memoryCost: 65536, timeCost: 4, parallelism: 3 };
    }

    /**
     * Get options for hashing
     * @returns argon2.Options options object
     */
    private getOptions(): argon2.Options {
        // You can customize this method to fetch options from a config or environment variables
        return this.getDefaultOptions();
    }
}