import { Tradeshift } from './Tradeshift';

class TradeshiftBox extends Tradeshift {
    protected environment: string = 'sandbox';

    public getName(): string {
        return 'tradeshiftBox';
    }
}

export { TradeshiftBox };