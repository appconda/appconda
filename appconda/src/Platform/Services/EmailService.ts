import e from "express";
import { BaseService } from "../BaseService";

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');

export interface EmailServiceAccessObject {
    smtpServer: string,
    smtpPort: string,
    username: string;
    password: string;
    tls: boolean;

}
export default class EmailService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.email';
    }

    get displayName(): string {
        return 'Email Service'
    }

    
    get  theme():string {
        return "#eb5768";
    } 

    get icon(): string {
        return "/images/services/email_32.png";
    }
    
    /* "label": "Email",
    "keywords": "email, email, mail, imap, smtp",
    "theme": "#eb5768", */

    async construct() {
    }

    async init() {

        const router = this.webServer.getRouter();

        router.get("/email/components", async (req: any, res: any) => {
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


        router.post("/email/send", async (req: e.Request, res: e.Response) => {
            try {

                const accessKey = req.headers['x-access-key'] as string;

                const form_email = req.body.form_email;
                const to_email = req.body.to_email;
                const subject = req.body.subject;
                const htmlTemplate = decodeURIComponent(req.body.htmlTemplate);
                const values = req.body.values;

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



                const issueUrl = await this.sendEmail(accessKey, form_email, to_email, subject, htmlTemplate,
                    typeof values === 'object' ? values : {});




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

        router.post('/email/createKey', async (req: e.Request, res: e.Response) => {
            const smtpServer = req.body.smtpServer;
            const smtpPort = req.body.smtpPort;
            const username = req.body.username;
            const password = req.body.password;
            const tls = req.body.tls;

            console.log('tls : ', tls)

            const accessKey = this.createKey({ tls, smtpServer, smtpPort, username, password });


            res.json({ accessKey });
        })
    }

    public createKey({ tls, smtpServer, smtpPort, username, password }: EmailServiceAccessObject) {

        return this.createKeyInternal({
            tls,
            smtpServer, smtpPort, username, password
        })
    }

    async sendEmail(accessKey: string,
        from_email: string,
        to_email: string, subject: string, html: string, values: any) {

        const accessObject: EmailServiceAccessObject = this.decodeKey(accessKey);
        console.log('accessKey : ', accessKey)
        console.log(accessObject)

        try {
            let transporter;
            if (accessObject.tls === true) {
                transporter = nodemailer.createTransport({
                    host: accessObject.smtpServer,
                    port: accessObject.smtpPort,
                    secure: true, // STARTTLS
                    auth: {
                        user: accessObject.username,
                        pass: accessObject.password,
                    }
                });
            } else {
                transporter = nodemailer.createTransport({
                    host: accessObject.smtpServer,
                    port: accessObject.smtpPort, // TLS için port
                    secure: false, // true ise port 465 kullanılmalı
                    auth: {
                        user: accessObject.username, // Outlook e-posta adresiniz
                        pass: accessObject.password // Outlook şifreniz
                    },
                    tls: {
                        // Bazı ağlarda gerekebilir
                        rejectUnauthorized: false
                    }
                });
            }


            /* let  */

            const _html = handlebars.compile(html);

            console.log('Sending email...')
            transporter.sendMail({
                from: from_email, // sender address
                to: to_email, // list of receivers
                subject,
                html: _html(values)
            }, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
            });
        } catch (e) {
            console.error(e);
        }

    }
}

