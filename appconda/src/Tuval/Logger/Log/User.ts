// src/Log/User.ts
export class User {
    private userId: string ;
    private userEmail: string ;
    private userName: string ;

    constructor(userId: string  = null as any, userEmail: string  = null as any, userName: string  = null as any) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
    }

    getId(): string  {
        return this.userId;
    }

    getEmail(): string {
        return this.userEmail;
    }

    getUsername(): string  {
        return this.userName;
    }
}
