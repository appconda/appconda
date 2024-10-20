import { Address } from "./Address";

export abstract class Adapter {
    protected static readonly METHOD_GET = 'GET';
    protected static readonly METHOD_POST = 'POST';
    protected static readonly METHOD_PUT = 'PUT';
    protected static readonly METHOD_PATCH = 'PATCH';
    protected static readonly METHOD_DELETE = 'DELETE';
    protected static readonly METHOD_HEAD = 'HEAD';
    protected static readonly METHOD_OPTIONS = 'OPTIONS';
    protected static readonly METHOD_CONNECT = 'CONNECT';
    protected static readonly METHOD_TRACE = 'TRACE';

    protected testMode: boolean;
    protected currency: string;

    /**
     * Set test mode
     */
    setTestMode(testMode: boolean): void {
        this.testMode = testMode;
    }

    /**
     * Get whether it's in test mode
     */
    getTestMode(): boolean {
        return this.testMode;
    }

    /**
     * Get name of the payment gateway
     */
    abstract getName(): string;

    /**
     * Set the currency for payments
     */
    setCurrency(currency: string): void {
        this.currency = currency;
    }

    /**
     * Get currently set currency for payments
     */
    getCurrency(): string {
        return this.currency;
    }

    /**
     * Make a purchase request
     */
    abstract purchase(amount: number, customerId: string, paymentMethodId: string | null, additionalParams: any[]): Promise<any[]>;

    /**
     * Refund payment
     */
    abstract refund(paymentId: string, amount?: number, reason?: string): Promise<any[]>;

    /**
     * Get a payment details
     */
    abstract getPayment(paymentId: string):Promise<any[]>;

    /**
     * Add a payment method
     */
    abstract createPaymentMethod(customerId: string, type: string, details: any[]):Promise<any[]>;

    /**
     * Update payment method billing details
     */
    abstract updatePaymentMethodBillingDetails(paymentMethodId: string, name?: string, email?: string, phone?: string, address?: any[]): Promise<any[]>;

    /**
     * Update payment method
     */
    abstract updatePaymentMethod(paymentMethodId: string, type: string, details: any[]): Promise<any[]>;

    /**
     * List payment methods
     */
    abstract listPaymentMethods(customerId: string): Promise<any[]>;

    /**
     * Remove payment method
     */
    abstract deletePaymentMethod(paymentMethodId: string): Promise<boolean>;

    /**
     * Add new customer in the gateway database
     */
    abstract createCustomer(name: string, email: string, address: any[], paymentMethod?: string): Promise<any[]>;

    /**
     * List customers
     */
    abstract listCustomers():Promise<any[]>;

    /**
     * Get customer details by ID
     */
    abstract getCustomer(customerId: string):Promise<any[]>;

    /**
     * Update customer details
     */
    abstract updateCustomer(customerId: string, name: string, email: string, address?: Address, paymentMethod?: string): Promise<any[]>;

    /**
     * Delete Customer
     */
    abstract deleteCustomer(customerId: string): Promise<boolean>;

    /**
     * List Payment Methods
     */
    abstract getPaymentMethod(customerId: string, paymentMethodId: string): Promise<any[]>;

    /**
     * Create setup for accepting future payments
     */
    abstract createFuturePayment(customerId: string, paymentMethod?: string, paymentMethodTypes?: string[], paymentMethodOptions?: any[], paymentMethodConfiguration?: string): Promise<any[]>;

    /**
     * List future payments associated with the provided customer or payment method
     */
    abstract listFuturePayments(customerId?: string, paymentMethodId?: string): Promise<any[]>;

    /**
     * Get Future payment
     */
    abstract getFuturePayment(id: string): Promise<any[]>;

    /**
     * Update future payment setup
     */
    abstract updateFuturePayment(id: string, customerId?: string, paymentMethod?: string, paymentMethodOptions?: any[], paymentMethodConfiguration?: string): Promise<any[]>;

    /**
     * Get mandate
     */
    abstract getMandate(id: string): Promise<any[]>;

    /**
     * Call
     * Make a request
     */
    protected async call(method: string, url: string, params: any[] = [], headers: any[] = [], options: any[] = []): Promise<any[]> {
        const responseHeaders: any = {};
        const query = this.buildQuery(params, headers['content-type']);
        const requestHeaders = this.buildHeaders(headers);

        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: method !== Adapter.METHOD_GET && method !== Adapter.METHOD_DELETE ? query : undefined,
            ...options
        });

        const responseBody = await response.text();
        const responseType = response.headers.get('content-type') || '';
        const responseStatus = response.status;

        let parsedBody: any;
        if (responseType.includes('application/json')) {
            parsedBody = JSON.parse(responseBody);
        } else {
            parsedBody = responseBody;
        }

        if (!response.ok) {
            throw new Error(parsedBody);
        }

        return parsedBody;
    }

    /**
     * Build query based on content type
     */
    private buildQuery(params: any[], contentType: string): string {
        switch (contentType) {
            case 'application/json':
                return JSON.stringify(params);
            case 'multipart/form-data':
                return this.flatten(params) as any;
            default:
                return new URLSearchParams(params).toString();
        }
    }

    /**
     * Build headers for the request
     */
    private buildHeaders(headers: any[]): Headers {
        const requestHeaders = new Headers();
        for (const [key, value] of Object.entries(headers)) {
            requestHeaders.append(key, value);
        }
        return requestHeaders;
    }

    /**
     * Flatten params array to multiple format
     */
    protected flatten(data: any[], prefix: string = ''): any[] {
        const output: any[] = [];

        for (const [key, value] of Object.entries(data)) {
            const finalKey = prefix ? `${prefix}[${key}]` : key;

            if (Array.isArray(value)) {
                output.push(...this.flatten(value, finalKey));
            } else {
                output.push({ [finalKey]: value });
            }
        }

        return output;
    }
}