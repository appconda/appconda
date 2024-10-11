

import { Validator } from '../../../Tuval/Core';
import { Role } from '../Helpers/Role';
import { Key } from './Key';
import { Label } from './Label';

export class Roles extends Validator {
    public static readonly ROLE_ANY = 'any';
    public static readonly ROLE_GUESTS = 'guests';
    public static readonly ROLE_USERS = 'users';
    public static readonly ROLE_USER = 'user';
    public static readonly ROLE_TEAM = 'team';
    public static readonly ROLE_MEMBER = 'member';
    public static readonly ROLE_LABEL = 'label';

    public static readonly ROLES = [
        Roles.ROLE_ANY,
        Roles.ROLE_GUESTS,
        Roles.ROLE_USERS,
        Roles.ROLE_USER,
        Roles.ROLE_TEAM,
        Roles.ROLE_MEMBER,
        Roles.ROLE_LABEL,
    ];

    public static readonly DIMENSION_VERIFIED = 'verified';
    public static readonly DIMENSION_UNVERIFIED = 'unverified';


    public static readonly USER_DIMENSIONS = [
        Roles.DIMENSION_VERIFIED,
        Roles.DIMENSION_UNVERIFIED,
    ];

    protected message: string = 'Roles Error';
    protected allowed: string[];
    protected length: number;

    public static readonly CONFIG = {
        [Roles.ROLE_ANY]: {
            identifier: { allowed: false, required: false },
            dimension: { allowed: false, required: false },
        },
        [Roles.ROLE_GUESTS]: {
            identifier: { allowed: false, required: false },
            dimension: { allowed: false, required: false },
        },
        [Roles.ROLE_USERS]: {
            identifier: { allowed: false, required: false },
            dimension: { allowed: true, required: false, options: Roles.USER_DIMENSIONS },
        },
        [Roles.ROLE_USER]: {
            identifier: { allowed: true, required: true },
            dimension: { allowed: true, required: false, options: Roles.USER_DIMENSIONS },
        },
        [Roles.ROLE_TEAM]: {
            identifier: { allowed: true, required: true },
            dimension: { allowed: true, required: false },
        },
        [Roles.ROLE_MEMBER]: {
            identifier: { allowed: true, required: true },
            dimension: { allowed: false, required: false },
        },
        [Roles.ROLE_LABEL]: {
            identifier: { allowed: true, required: true },
            dimension: { allowed: false, required: false },
        },
    };

  
 

    constructor(length: number = 0, allowed: string[] = Roles.ROLES) {
        super();
        this.length = length;
        this.allowed = allowed;
    }

    public getDescription(): string {
        return this.message;
    }

    public isValid(roles: any): boolean {
        if (!Array.isArray(roles)) {
            this.message = 'Roles must be an array of strings.';
            return false;
        }

        if (this.length && roles.length > this.length) {
            this.message = `You can only provide up to ${this.length} roles.`;
            return false;
        }

        for (const role of roles) {
            if (typeof role !== 'string') {
                this.message = 'Every role must be of type string.';
                return false;
            }
            if (role === '*') {
                this.message = 'Wildcard role "*" has been replaced. Use "any" instead.';
                return false;
            }
            if (role.includes('role:')) {
                this.message = 'Roles using the "role:" prefix have been removed. Use "users", "guests", or "any" instead.';
                return false;
            }

            let isAllowed = false;
            for (const allowed of this.allowed) {
                if (role.startsWith(allowed)) {
                    isAllowed = true;
                    break;
                }
            }
            if (!isAllowed) {
                this.message = `Role "${role}" is not allowed. Must be one of: ${this.allowed.join(', ')}.`;
                return false;
            }

            try {
                const parsedRole = Role.parse(role);
                const roleName = parsedRole.getRole();
                const identifier = parsedRole.getIdentifier();
                const dimension = parsedRole.getDimension();

                if (!this.isValidRole(roleName, identifier, dimension)) {
                    return false;
                }
            } catch (e: any) {
                this.message = e.message;
                return false;
            }
        }
        return true;
    }

    public isArray(): boolean {
        return false;
    }

    public getType(): string {
        return Roles.TYPE_ARRAY;
    }

    protected isValidRole(role: string, identifier: string, dimension: string): boolean {
        const key = new Key();
        const label = new Label();

        const config = Roles.CONFIG[role] ?? null;

        if (!config) {
            this.message = `Role "${role}" is not allowed. Must be one of: ${Roles.ROLES.join(', ')}.`;
            return false;
        }

        const { allowed: idAllowed, required: idRequired } = config.identifier;
        const { allowed: dimAllowed, required: dimRequired, options: dimOptions = [dimension] } = config.dimension;

        if (!idAllowed && identifier) {
            this.message = `Role "${role}" cannot have an ID value.`;
            return false;
        }

        if (idAllowed && idRequired && !identifier) {
            this.message = `Role "${role}" must have an ID value.`;
            return false;
        }

        if (idAllowed && identifier) {
            if (role === Roles.ROLE_LABEL && !label.isValid(identifier)) {
                this.message = `Role "${role}" identifier value is invalid: ${label.getDescription()}`;
                return false;
            } else if (role !== Roles.ROLE_LABEL && !key.isValid(identifier)) {
                this.message = `Role "${role}" identifier value is invalid: ${key.getDescription()}`;
                return false;
            }
        }

        if (!dimAllowed && dimension) {
            this.message = `Role "${role}" cannot have a dimension value.`;
            return false;
        }

        if (dimAllowed && dimRequired && !dimension) {
            this.message = `Role "${role}" must have a dimension value.`;
            return false;
        }

        if (dimAllowed && dimension) {
            if (!dimOptions.includes(dimension)) {
                this.message = `Role "${role}" dimension value is invalid. Must be one of: ${dimOptions.join(', ')}.`;
                return false;
            }
            if (!key.isValid(dimension)) {
                this.message = `Role "${role}" dimension value is invalid: ${key.getDescription()}`;
                return false;
            }
        }

        return true;
    }
}