import { Key } from './Key';

export class UID extends Key {
    public getDescription(): string {
        return 'UID must contain at most 36 chars. Valid chars are a-z, A-Z, 0-9, and underscore. Can\'t start with a leading underscore';
    }
}