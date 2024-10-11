import { DatabaseService } from "./DatabaseService";
import { EmailService } from "./EmailService";
import { ScheduleService } from "./ScheduleService";
import { SchemaService } from "./SchemaService";


declare global {
    const module: {exports: any};
    export class RealmoceanService {
        Name: string;
        services: any;
        databaseService: DatabaseService;
        schemaService: SchemaService;
        emailService: EmailService;
        scheduleService: ScheduleService
    }
}