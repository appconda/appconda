import { Paypal } from './Paypal';

class PaypalSandbox extends Paypal {
    protected environment: string = 'sandbox';

    public getName(): string {
        return 'paypalSandbox';
    }
}

export { PaypalSandbox };