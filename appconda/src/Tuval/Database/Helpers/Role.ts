export class Role {
    constructor(
        private role: string,
        private identifier: string = '',
        private dimension: string = '',
    ) {}

    public toString(): string {
        let str = this.role;
        if (this.identifier) {
            str += `:${this.identifier}`;
        }
        if (this.dimension) {
            str += `/${this.dimension}`;
        }
        return str;
    }

    public getRole(): string {
        return this.role;
    }

    public getIdentifier(): string {
        return this.identifier;
    }

    public getDimension(): string {
        return this.dimension;
    }

    public static parse(role: string): Role {
        const roleParts = role.split(':');
        const hasIdentifier = roleParts.length > 1;
        const hasDimension = role.includes('/');
        const roleName = roleParts[0];

        if (!hasIdentifier && !hasDimension) {
            return new Role(roleName);
        }

        if (hasIdentifier && !hasDimension) {
            const identifier = roleParts[1];
            return new Role(roleName, identifier);
        }

        if (!hasIdentifier) {
            const dimensionParts = role.split('/');
            if (dimensionParts.length !== 2) {
                throw new Error('Only one dimension can be provided');
            }

            const roleName = dimensionParts[0];
            const dimension = dimensionParts[1];

            if (!dimension) {
                throw new Error('Dimension must not be empty');
            }
            return new Role(roleName, '', dimension);
        }

        const dimensionParts = roleParts[1].split('/');
        if (dimensionParts.length !== 2) {
            throw new Error('Only one dimension can be provided');
        }

        const identifier = dimensionParts[0];
        const dimension = dimensionParts[1];

        if (!dimension) {
            throw new Error('Dimension must not be empty');
        }
        return new Role(roleName, identifier, dimension);
    }

    public static user(identifier: string, status: string = ''): Role {
        return new Role('user', identifier, status);
    }

    public static users(status: string = ''): Role {
        return new Role('users', '', status);
    }

    public static team(identifier: string, dimension: string = ''): Role {
        return new Role('team', identifier, dimension);
    }

    public static label(identifier: string): Role {
        return new Role('label', identifier, '');
    }

    public static any(): Role {
        return new Role('any');
    }

    public static guests(): Role {
        return new Role('guests');
    }

    public static member(identifier: string): Role {
        return new Role('member', identifier);
    }
}