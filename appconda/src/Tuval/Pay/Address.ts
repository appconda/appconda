export class Address {
    protected city: string;
    protected country: string;
    protected line1: string | null;
    protected line2: string | null;
    protected postalCode: string | null;
    protected state: string | null;

    constructor(city: string, country: string, line1: string | null = null, line2: string | null = null, postalCode: string | null = null, state: string | null = null) {
        this.city = city;
        this.country = country;
        this.line1 = line1;
        this.line2 = line2;
        this.postalCode = postalCode;
        this.state = state;
    }

    /**
     * Get the value of city
     */
    getCity(): string | null {
        return this.city ?? null;
    }

    /**
     * Set the value of city
     */
    setCity(city: string): this {
        this.city = city;
        return this;
    }

    /**
     * Get the value of country
     */
    getCountry(): string {
        return this.country;
    }

    /**
     * Set the value of country
     */
    setCountry(country: string): this {
        this.country = country;
        return this;
    }

    /**
     * Get the value of line1
     */
    getLine1(): string | null {
        return this.line1 ?? null;
    }

    /**
     * Set the value of line1
     */
    setLine1(line1: string): this {
        this.line1 = line1;
        return this;
    }

    /**
     * Get the value of line2
     */
    getLine2(): string | null {
        return this.line2 ?? null;
    }

    /**
     * Set the value of line2
     */
    setLine2(line2: string): this {
        this.line2 = line2;
        return this;
    }

    /**
     * Get the value of postalCode
     */
    getPostalCode(): string | null {
        return this.postalCode ?? null;
    }

    /**
     * Set the value of postalCode
     */
    setPostalCode(postalCode: string): this {
        this.postalCode = postalCode;
        return this;
    }

    /**
     * Get the value of state
     */
    getState(): string | null {
        return this.state ?? null;
    }

    /**
     * Set the value of state
     */
    setState(state: string): this {
        this.state = state;
        return this;
    }

    /**
     * Get Object as an array
     */
    asArray(): { [key: string]: string | null } {
        return {
            city: this.city ?? null,
            country: this.country ?? null,
            line1: this.line1 ?? null,
            line2: this.line2 ?? null,
            postal_code: this.postalCode ?? null,
            state: this.state ?? null,
        };
    }
}