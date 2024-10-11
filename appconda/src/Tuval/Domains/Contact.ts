export class Contact {
    constructor(
        public firstname: string,
        public lastname: string,
        public phone: string,
        public email: string,
        public address1: string,
        public address2: string,
        public address3: string,
        public city: string,
        public state: string,
        public country: string,
        public postalcode: string,
        public org: string,
        public owner: string | null = null,
    ) {}

    toArray(): Record<string, string> {
        const owner = this.owner ?? `${this.firstname} ${this.lastname}`;

        return {
            firstname: this.firstname,
            lastname: this.lastname,
            phone: this.phone,
            email: this.email,
            address1: this.address1,
            address2: this.address2,
            address3: this.address3,
            city: this.city,
            state: this.state,
            country: this.country,
            postalcode: this.postalcode,
            org: this.org,
            owner: owner,
        };
    }
}
