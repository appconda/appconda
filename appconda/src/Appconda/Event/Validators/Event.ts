
import { Validator } from '../../../Tuval/Core';
import { Config } from '../../../Tuval/Config';

export class Event extends Validator {
    protected message: string = 'Event is not valid.';

    public getDescription(): string {
        return this.message;
    }

    public isValid(value: any): boolean {
        const events = Config.getParam('events', []);
        const parts = (value ?? '').split('.');
        const count = parts.length;

        if (count < 2 || count > 7) {
            return false;
        }

        const type = parts[0] ?? false;
        const resource = parts[1] ?? false;
        const hasSubResource = count > 3 && events[type]?.['$resource'] && events[type]?.[parts[2]]?.['$resource'];
        const hasSubSubResource = count > 5 && hasSubResource && events[type]?.[parts[2]]?.[parts[4]]?.['$resource'];

        if (!type || !resource) {
            return false;
        }

        let subType, subResource, subSubType, subSubResource, attribute;

        if (hasSubResource) {
            subType = parts[2];
            subResource = parts[3];
        }

        if (hasSubSubResource) {
            subSubType = parts[4];
            subSubResource = parts[5];
            if (count === 8) {
                attribute = parts[7];
            }
        }

        if (hasSubResource && !hasSubSubResource) {
            if (count === 6) {
                attribute = parts[5];
            }
        }

        if (!hasSubResource) {
            if (count === 4) {
                attribute = parts[3];
            }
        }

        subSubType = subSubType ?? false;
        subSubResource = subSubResource ?? false;
        subType = subType ?? false;
        subResource = subResource ?? false;
        attribute = attribute ?? false;

        const action = (() => {
            if (!hasSubResource && count > 2) return parts[2];
            if (hasSubSubResource) return parts[6] ?? false;
            if (hasSubResource && count > 4) return parts[4];
            return false;
        })();

        if (!events.hasOwnProperty(type)) {
            return false;
        }

        if (subType) {
            if (action && !events[type][subType]?.hasOwnProperty(action)) {
                return false;
            }
            if (!subResource || !events[type]?.hasOwnProperty(subType)) {
                return false;
            }
        } else {
            if (action && !events[type]?.hasOwnProperty(action)) {
                return false;
            }
        }

        if (attribute) {
            if (subType) {
                if (!events[type][subType][action]?.hasOwnProperty(attribute)) {
                    return false;
                }
            } else {
                if (!events[type][action]?.hasOwnProperty(attribute)) {
                    return false;
                }
            }
        }

        return true;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Validator.TYPE_STRING;
    }
}