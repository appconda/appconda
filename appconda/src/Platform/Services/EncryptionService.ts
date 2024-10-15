import e from "express";
import { BaseService } from "../BaseService";


export default class EncryptionService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.encryption';
    }

    get displayName(): string {
        return 'Encryption Service'
    }

    async init() {



        const router = this.webServer.getRouter();

        router.post('/encryption/createKey', async (req: e.Request, res: e.Response) => {
            const accessKey = this.createKeyInternal(req.body);
            res.json({ accessKey });
        })
    }

    async createKey(params: object) {
        const accessKey = this.createKeyInternal(params);
        return accessKey;
    }





}


