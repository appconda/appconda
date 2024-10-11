export abstract class Hash {
    protected options: { [key: string]: any } = {};

    constructor(options: { [key: string]: any } = {}) {
        this.setOptions(options);
    }

    /**
     * Set hashing algo options
     * @param options Hashing-algo specific options
     * @returns this
     */
    public setOptions(options: { [key: string]: any }): this {
        this.options = { ...this.getDefaultOptions(), ...options };
        return this;
    }

    /**
     * Get hashing algo options
     * @returns Hashing-algo specific options
     */
    public getOptions(): { [key: string]: any } {
        return this.options;
    }

    /**
     * Hash the input password
     * @param password Input password to hash
     * @returns string hash
     */
    abstract hash(password: string): Promise<string>;

    /**
     * Verify the input password against the hash
     * @param password Input password to validate
     * @param hash Hash to verify password against
     * @returns boolean true if password matches hash
     */
    abstract verify(password: string, hash: string): Promise<boolean>;

    
     
    abstract getDefaultOptions(): Promise<any>;

}