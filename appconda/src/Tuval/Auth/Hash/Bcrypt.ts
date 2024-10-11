import * as bcrypt from 'bcrypt';

export class Bcrypt {
    /**
     * Hash the input password
     * @param password Input password to hash
     * @returns Promise<string> hash
     */
    public async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.getOptions().cost);
        return await bcrypt.hash(password, salt);
    }

    /**
     * Verify the input password against the hash
     * @param password Input password to validate
     * @param hash Hash to verify password against
     * @returns Promise<boolean> true if password matches hash
     */
    public async verify(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Get default options for specific hashing algo
     * @returns { cost: number } options object
     */
    public getDefaultOptions(): { cost: number } {
        return { cost: 8 };
    }

    /**
     * Get options for hashing
     * @returns { cost: number } options object
     */
    private getOptions(): { cost: number } {
        // You can customize this method to fetch options from a config or environment variables
        return this.getDefaultOptions();
    }
}