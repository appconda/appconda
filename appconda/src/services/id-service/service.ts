import e from "express";
import { BaseService } from "../../BaseService";
import { nanoid } from "./nanoid/nanoid";

const axios = require('axios');

interface JiraAccessObject {
    host: string,
    username: string,
    token: string
}

export default class IDService extends BaseService {

    public get uid(): string {
        return 'com.appconda.service.id';
    }

    get displayName(): string {
        return 'Jira Cloud Platform'
    }

    get  theme():string {
        return "#0052CC";
    } 

    get icon(): string {
        return "/images/services/jira_64.png";
    }

    async init() {
        
    }

    async generateID(): Promise<string> {
        return nanoid();
    }

}


