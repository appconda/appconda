import { Adapter } from "./Adapter";
import { Address } from "./Address";

export class Pay {
    protected adapter: Adapter;

    /**
     * @param adapter Adapter instance
     */
    constructor(adapter: Adapter) {
        this.adapter = adapter;
    }

    /**
     * Set Test Mode
     */
    setTestMode(testMode: boolean): void {
        this.adapter.setTestMode(testMode);
    }

    /**
     * Get Test Mode
     */
    getTestMode(): boolean {
        return this.adapter.getTestMode();
    }

    /**
     * Get Name
     */
    getName(): string {
        return this.adapter.getName();
    }

    /**
     * Set Currency
     */
    setCurrency(currency: string): void {
        this.adapter.setCurrency(currency);
    }

    /**
     * Get Currency
     */
    getCurrency(): string {
        return this.adapter.getCurrency();
    }

    /**
     * Purchase
     */
    purchase(amount: number, customerId: string, paymentMethodId: string | null = null, additionalParams: any[] = []): Promise<any[]> {
        return this.adapter.purchase(amount, customerId, paymentMethodId, additionalParams);
    }

    /**
     * Refund Payment
     */
    refund(paymentId: string, amount: number): Promise<any[]> {
        return this.adapter.refund(paymentId, amount);
    }

    /**
     * Get a payment details
     */
    getPayment(paymentId: string): Promise<any[]> {
        return this.adapter.getPayment(paymentId);
    }

    /**
     * Delete Payment Method
     */
    deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
        return this.adapter.deletePaymentMethod(paymentMethodId);
    }

    /**
     * Create Payment Method
     */
    createPaymentMethod(customerId: string, type: string, details: any[]): Promise<any[]> {
        return this.adapter.createPaymentMethod(customerId, type, details);
    }

    /**
     * Update Payment Method Billing Details
     */
    updatePaymentMethodBillingDetails(paymentMethodId: string, type: string, name: string | null = null, email: string | null = null, phone: string | null = null, address: any[] | null = null): Promise<any[]> {
        return this.adapter.updatePaymentMethodBillingDetails(paymentMethodId, name, email, phone, address);
    }

    /**
     * Update Payment Method
     */
    updatePaymentMethod(paymentMethodId: string, type: string, details: any[]): Promise<any[]> {
        return this.adapter.updatePaymentMethod(paymentMethodId, type, details);
    }

    /**
     * Get Payment Method
     */
    getPaymentMethod(customerId: string, paymentMethodId: string): Promise<any[]> {
        return this.adapter.getPaymentMethod(customerId, paymentMethodId);
    }

    /**
     * List Payment Methods
     */
    listPaymentMethods(customerId: string): Promise<any[]> {
        return this.adapter.listPaymentMethods(customerId);
    }

    /**
     * List Customers
     */
    listCustomers(): Promise<any[]> {
        return this.adapter.listCustomers();
    }

    /**
     * Create Customer
     */
    createCustomer(name: string, email: string, address: any[] = [], paymentMethod: string | null = null): Promise<any[]> {
        return this.adapter.createCustomer(name, email, address, paymentMethod);
    }

    /**
     * Get Customer
     */
    getCustomer(customerId: string): Promise<any[]> {
        return this.adapter.getCustomer(customerId);
    }

    /**
     * Update Customer
     */
    updateCustomer(customerId: string, name: string, email: string, address: Address | null = null, paymentMethod: string | null = null): Promise<any[]> {
        return this.adapter.updateCustomer(customerId, name, email, address, paymentMethod);
    }

    /**
     * Delete Customer
     */
    deleteCustomer(customerId: string): Promise<boolean> {
        return this.adapter.deleteCustomer(customerId);
    }

    /**
     * Create Setup for accepting future payments
     */
    createFuturePayment(customerId: string, paymentMethod: string | null = null, paymentMethodTypes: string[] = ['card'], paymentMethodOptions: any[] = [], paymentMethodConfiguration: string | null = null): Promise<any[]> {
        return this.adapter.createFuturePayment(customerId, paymentMethod, paymentMethodTypes, paymentMethodOptions, paymentMethodConfiguration);
    }

    /**
     * Get future payment
     */
    getFuturePayment(id: string): Promise<any[]> {
        return this.adapter.getFuturePayment(id);
    }

    /**
     * Update Future payment
     */
    updateFuturePayment(id: string, customerId: string | null = null, paymentMethod: string | null = null, paymentMethodOptions: any[] = [], paymentMethodConfiguration: string | null = null): Promise<any[]> {
        return this.adapter.updateFuturePayment(id, customerId, paymentMethod, paymentMethodOptions, paymentMethodConfiguration);
    }

    /**
     * List future payment
     */
    listFuturePayment(customerId: string | null, paymentMethodId: string | null = null): Promise<any[]> {
        return this.adapter.listFuturePayments(customerId, paymentMethodId);
    }

    /**
     * Get mandate
     */
    getMandate(id: string): Promise<any[]> {
        return this.adapter.getMandate(id);
    }
}