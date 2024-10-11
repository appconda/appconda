export interface Connection {
    rightPushArray(queue: string, payload: any[]): Promise<boolean>;
    rightPopArray(queue: string, timeout: number): Promise<any | false>;
    rightPopLeftPushArray(queue: string, destination: string, timeout: number): Promise<any[] | false>;
    leftPushArray(queue: string, payload: any): Promise<boolean>;
    leftPopArray(queue: string, timeout: number): Promise<any[] | false>;
    rightPush(queue: string, payload: string): Promise<boolean>;
    rightPop(queue: string, timeout: number): Promise<string | false>;
    rightPopLeftPush(queue: string, destination: string, timeout: number): Promise<string | false>;
    leftPush(queue: string, payload: string): Promise<boolean>;
    leftPop(queue: string, timeout: number): Promise<string | false>;
    listRemove(queue: string, key: string): Promise<boolean>;
    listSize(key: string): Promise<number>;
    listRange(key: string, total: number, offset: number): Promise<any[]>;
    remove(key: string): Promise<boolean>;
    move(queue: string, destination: string): Promise<boolean>;
    set(key: string, value: string): Promise<boolean>;
    get(key: string): Promise<any | string | null>;
    setArray(key: string, value: any[]): Promise<boolean>;
    increment(key: string): Promise<number>;
    decrement(key: string): Promise<number>;
    ping(): Promise<boolean>;
}