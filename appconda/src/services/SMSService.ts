import e from "express";
import { BaseService } from "../BaseService";

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');


const VatanSmsProvider = {
    send: async (providerData, message, phones) => {

        const myHeaders = new Headers();
        /*   myHeaders.append("Authorization", `Bearer ${accessObject.token}`);
          myHeaders.append("Bimser-Encrypted-Data", accessObject.eData);
          myHeaders.append("Bimser-Language", "tr-TR");
          myHeaders.append("Content-Type", "application/json"); */

        const params = {
            "api_id": "9919f7550941ae200253a8f9",
            "api_key": "c334e032dac06937c539740c", //Size özel verilmiş olan api keyi
            "sender": "PEDASFTYZLM", //Gönderici ad
            "message_type": "normal", //trkçe sms göndermek için turkce yaziniz
            "message": "Bu bir test mesajıdır.",
            "message_content_type": "bilgi", // ticari smsler için "ticari"
            "phones": [
                "5325889682",
                "5451104747"
            ] //Telefon numaralarını , ile ayırarak ekleyebilirsiniz.
        }
        const raw = JSON.stringify(params);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        const response = await fetch('https://api.vatansms.net/api/v1/1toN', requestOptions as any);
    }
}

const providers = {
    'vatan': VatanSmsProvider
}

export interface SmsServiceAccessObject {
    provider: string,
    sender: string;
    providerData: object;

}
export default class SmsService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.sms';
    }

    get displayName(): string {
        return 'SMS Service'
    }


    get theme(): string {
        return "#D10A10";
    }

    get icon(): string {
        return "/images/services/sms-dk_256.png";
    }

    /* "label": "Email",
    "keywords": "email, email, mail, imap, smtp",
    "theme": "#eb5768", */

    async construct() {
    }

    async init() {

        const router = this.webServer.getRouter();

        router.get("/sms/components", async (req: any, res: any) => {
            try {
                const components = this.components.map(component => ({
                    uid: component.uid,
                    name: component.displayName,
                    description: component.description,
                    config: component.buildConfig()
                }))
                return res.json({
                    components
                });
            }
            catch (e) {

                return res.json({
                    error: true
                });
            }
        });


        router.post("/sms/send", async (req: e.Request, res: e.Response) => {
            try {

                const accessKey = req.headers['x-access-key'] as string;

                const message = req.body.message;
                const phones = req.body.phones;

                //  const form_email = 'team@celmino.io';
                //  const to_email = 'stanoncloud@gmail.com';
                // const subject = 'sdfsdf';
                //  const htmlTemplate = '<p>AAA</p>';
                //   const values = {};

                /*    const key = this.emailService.createKey({
                       smtpServer: smtp_server,
                       smtpPort: smtp_port,
                       username: smtp_username,
                       password: smtp_password
                   }); */



                const issueUrl = await this.send(accessKey, message, phones);




                /*  console.log(key);
                 await this.emailService
                 .sendEmail(key,form_email,to_email,subject,htmlTemplate,values); */



                res.status(200);
                return res.json({
                    issueUrl
                });
            }
            catch (e) {
                console.error(e);
                res.status(500);
                return res.json({
                    error: e
                });
            }
        });

        router.get("/email/ping", async (req: e.Request, res: e.Response) => {
            try {
                console.log(req.headers);

                return res.json({
                    ping: true
                });
            }
            catch (e) {
                console.error(e);
                res.status(500);
                return res.json({
                    error: e
                });
            }
        });

        router.post('/sms/createKey', async (req: e.Request, res: e.Response) => {


            const provider = req.body.provider;
            const sender = req.body.sender;
            const providerData = req.body.providerData;

            const accessKey = this.createKey({ provider, sender, providerData });


            res.json({ accessKey });
        })
    }

    public createKey({ provider, sender, providerData }: SmsServiceAccessObject) {

        return this.createKeyInternal({ provider, sender, providerData });
    }

    async send(accessKey: string, message: string, phones: string[]) {

        try {

            const accessObject: SmsServiceAccessObject = this.decodeKey(accessKey);
            const provider = providers[accessObject.provider];
            if (provider != null && typeof provider.send === 'function') {
                await provider.send(accessObject.providerData, message, phones);
            } else {
                throw new Error('Provider not found. ')
            }


        } catch (e) {
            console.error(e);
        }

    }
}

