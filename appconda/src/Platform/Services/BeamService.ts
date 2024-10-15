import e from "express";
import { BaseService } from "../BaseService";

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');




export interface BeamServiceAccessObject {
 

}
export default class BeamService extends BaseService {

    public get uid(): string {
        return 'com.realmocean.service.beam';
    }

    get displayName(): string {
        return 'Beam Service'
    }


    get theme(): string {
        return "#EA0A2A";
    }

    get icon(): string {
        return "/images/services/beam-250.png";
    }

    /* "label": "Email",
    "keywords": "email, email, mail, imap, smtp",
    "theme": "#eb5768", */

    async construct() {
    }

    async init() {

        const router = this.webServer.getRouter();

       
    }

    public createKey({  }: BeamService) {

        return this.createKeyInternal({ });
    }

   
}

