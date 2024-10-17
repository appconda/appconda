import { Adapter } from '../Adapter';
import { Address } from '../Address';

export class Stripe extends Adapter {
    private baseUrl: string = 'https://api.stripe.com/v1';
    private secretKey: string;

    constructor(secretKey: string, currency: string = 'USD') {
        super();
        this.secretKey = secretKey;
        this.currency = currency;
    }

    /**
     * Get name of the payment gateway
     */
    getName(): string {
        return 'Stripe';
    }

    /**
     * Make a purchase request
     */
    async purchase(amount: number, customerId: string, paymentMethodId: string | null = null, additionalParams: any[] = []): Promise<any[]> {
        const path = '/payment_intents';
        let requestBody: any = {
            amount: amount,
            currency: this.currency,
            customer: customerId,
            payment_method: paymentMethodId,
            off_session: 'true',
            confirm: 'true',
        };

        requestBody = { ...requestBody, ...additionalParams };
        const result = await this.execute(Adapter.METHOD_POST, path, requestBody);

        return result;
    }

    /**
     * Refund payment
     */
    async refund(paymentId: string, amount: number | null = null, reason: string | null = null): Promise<any[]> {
        const path = '/refunds';
        const requestBody: any = { payment_intent: paymentId };
        if (amount !== null) {
            requestBody.amount = amount;
        }

        if (reason !== null) {
            requestBody.reason = reason;
        }

        return await this.execute(Adapter.METHOD_POST, path, requestBody);
    }

    /**
     * Get a payment details
     */
    async getPayment(paymentId: string): Promise<any[]> {
        const path = `/payment_intents/${paymentId}`;

        return await this.execute(Adapter.METHOD_GET, path);
    }

    /**
     * Add a credit card for customer
     */
    async createPaymentMethod(customerId: string, type: string, paymentMethodDetails: any[]): Promise<any[]> {
        let path = '/payment_methods';

        const requestBody = {
            type: type,
            [type]: paymentMethodDetails,
        };

        // Create payment method
        const paymentMethod = await this.execute(Adapter.METHOD_POST, path, requestBody);
        const paymentMethodId = paymentMethod['id'];

        // attach payment method to the customer
        path += `/${paymentMethodId}/attach`;

        return await this.execute(Adapter.METHOD_POST, path, { customer: customerId });
    }

    /**
     * List cards
     */
    async listPaymentMethods(customerId: string): Promise<any[]> {
        const path = `/customers/${customerId}/payment_methods`;

        return await this.execute(Adapter.METHOD_GET, path);
    }

    /**
     * List Customer Payment Methods
     */
    async getPaymentMethod(customerId: string, paymentMethodId: string): Promise<any[]> {
        const path = `/customers/${customerId}/payment_methods/${paymentMethodId}`;

        return await this.execute(Adapter.METHOD_GET, path);
    }

    /**
     * Update billing details
     */
    async updatePaymentMethodBillingDetails(paymentMethodId: string, name: string | null = null, email: string | null = null, phone: string | null = null, address: any[] | null = null): Promise<any[]> {
        const path = `/payment_methods/${paymentMethodId}`;
        const requestBody: any = { billing_details: {} };
        if (name) {
            requestBody.billing_details.name = name;
        }
        if (email) {
            requestBody.billing_details.email = email;
        }
        if (phone) {
            requestBody.billing_details.phone = phone;
        }
        if (address) {
            requestBody.billing_details.address = address;
        }

        return await this.execute(Adapter.METHOD_POST, path, requestBody);
    }

    async updatePaymentMethod(paymentMethodId: string, type: string, details: any[]): Promise<any[]> {
        const path = `/payment_methods/${paymentMethodId}`;

        const requestBody = {
            [type]: details,
        };

        return await this.execute(Adapter.METHOD_POST, path, requestBody);
    }

    /**
     * Delete a credit card record
     */
    async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
        const path = `/payment_methods/${paymentMethodId}/detach`;
        await this.execute(Adapter.METHOD_POST, path);

        return true;
    }

    /**
     * Add new customer in the gateway database
     */
    async createCustomer(name: string, email: string, address: any[] = [], paymentMethod: string | null = null): Promise<any[]> {
        const path = '/customers';
        const requestBody: any = {
            name: name,
            email: email,
        };
        if (paymentMethod) {
            requestBody.payment_method = paymentMethod;
        }
        if (address.length > 0) {
            requestBody.address = address;
        }
        const result = await this.execute(Adapter.METHOD_POST, path, requestBody);

        return result;
    }

    /**
     * List customers
     */
    async listCustomers(): Promise<any[]> {
        return await this.execute(Adapter.METHOD_GET, '/customers');
    }

    /**
     * Get customer details by ID
     */
    async getCustomer(customerId: string): Promise<any[]> {
        const path = `/customers/${customerId}`;
        const result = await this.execute(Adapter.METHOD_GET, path);

        return result;
    }

    /**
     * Update customer details
     */
    async updateCustomer(customerId: string, name: string, email: string, address: Address | null = null, paymentMethod: string | null = null): Promise<any[]> {
        const path = `/customers/${customerId}`;
        const requestBody: any = {
            name: name,
            email: email,
        };
        if (paymentMethod) {
            requestBody.payment_method = paymentMethod;
        }
        if (address) {
            requestBody.address = address.asArray();
        }

        return await this.execute(Adapter.METHOD_POST, path, requestBody);
    }

    /**
     * Delete customer by ID
     */
    async deleteCustomer(customerId: string): Promise<boolean> {
        const path = `/customers/${customerId}`;
        const result = await this.execute(Adapter.METHOD_DELETE, path);

        return result['deleted'] ?? false;
    }

    async createFuturePayment(customerId: string, paymentMethod: string | null = null, paymentMethodTypes: string[] = ['card'], paymentMethodOptions: any[] = [], paymentMethodConfiguration: string | null = null): Promise<any[]> {
        const path = '/setup_intents';
        const requestBody: any = {
            customer: customerId,
            payment_method_types: paymentMethodTypes,
        };

        if (paymentMethod) {
            requestBody.payment_method = paymentMethod;
        }

        if (paymentMethodConfiguration) {
            requestBody.payment_method_configuration = paymentMethodConfiguration;
            requestBody.automatic_payment_methods = {
                enabled: 'true',
            };
            delete requestBody.payment_method_types;
        }

        if (paymentMethodOptions.length > 0) {
            requestBody.payment_method_options = paymentMethodOptions;
        }

        const result = await this.execute(Adapter.METHOD_POST, path, requestBody);

        return result;
    }

    async getFuturePayment(id: string): Promise<any[]> {
        const path = `/setup_intents/${id}`;

        return await this.execute(Adapter.METHOD_GET, path);
    }

    async listFuturePayments(customerId: string | null = null, paymentMethodId: string | null = null): Promise<any[]> {
        const path = '/setup_intents';
        const requestBody: any = {};
        if (customerId) {
            requestBody.customer = customerId;
        }

        if (paymentMethodId) {
            requestBody.payment_method = paymentMethodId;
        }
        const result = await this.execute(Adapter.METHOD_GET, path, requestBody);

        return result['data'];
    }

    async updateFuturePayment(id: string, customerId: string | null = null, paymentMethod: string | null = null, paymentMethodOptions: any[] = [], paymentMethodConfiguration: string | null = null): Promise<any[]> {
        const path = `/setup_intents/${id}`;
        const requestBody: any = {};
        if (customerId) {
            requestBody.customer = customerId;
        }
        if (paymentMethod) {
            requestBody.payment_method = paymentMethod;
        }
        if (paymentMethodConfiguration) {
            requestBody.payment_method_configuration = paymentMethodConfiguration;
        }
        if (paymentMethodOptions.length > 0) {
            requestBody.payment_method_options = paymentMethodOptions;
        }

        return await this.execute(Adapter.METHOD_POST, path, requestBody);
    }

    /**
     * Get mandate
     */
    async getMandate(id: string): Promise<any[]> {
        const path = `/mandates/${id}`;

        return await this.execute(Adapter.METHOD_GET, path);
    }

    /**
     * Execute
     */
    private async execute(method: string, path: string, requestBody: any = {}, headers: any = {}): Promise<any[]> {
        headers = { ...{ 'content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${this.secretKey}` }, ...headers };

        return await this.call(method, `${this.baseUrl}${path}`, requestBody, headers);
    }
}