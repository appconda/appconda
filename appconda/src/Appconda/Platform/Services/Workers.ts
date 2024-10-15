import { Service } from "../../../Tuval/Platform/Service";
import { Audits } from "../Workers/Audits";
import { Certificates } from "../Workers/Certificates";
import { Databases } from "../Workers/Databases";
import { Deletes } from "../Workers/Deletes";
import { Functions } from "../Workers/Functions";
import { Mails } from "../Workers/Mails";

export class Workers extends Service {
    constructor() {
        super();
        this.type = Service.TYPE_WORKER;
        this
            .addAction(Audits.getName(), new Audits())
           // .addAction(Builds.getName(), new Builds())
            .addAction(Certificates.getName(), new Certificates())
            .addAction(Databases.getName(), new Databases())
            .addAction(Deletes.getName(), new Deletes())
            .addAction(Functions.getName(), new Functions())
            .addAction(Mails.getName(), new Mails())
            //.addAction(Messaging.getName(), new Messaging())
            //.addAction(Webhooks.getName(), new Webhooks())
            //.addAction(UsageDump.getName(), new UsageDump())
            //.addAction(Usage.getName(), new Usage())
            //.addAction(Migrations.getName(), new Migrations());
    }
}