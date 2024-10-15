import { Audit } from "../../Tuval/Audit";
import { Document, Exception } from "../../Tuval/Core";
import { Database } from "../../Tuval/Database";
import { Action } from "../../Tuval/Platform/Action";
import { Message } from "../../Tuval/Queue";

export class Audits extends Action {
    public static getName(): string {
        return 'audits';
    }

    constructor() {
        super();
        this.desc('Audits worker')
            .inject('message')
            .inject('dbForProject')
            .callback((message: Message, dbForProject: Database) => this.action(message, dbForProject));
    }

    public async action(message: Message, dbForProject: Database): Promise<void> {
        const payload = message.getPayload() ?? [];

        if (Object.keys(payload).length === 0) {
            throw new Exception('Missing payload');
        }

        const event = payload['event'] ?? '';
        const auditPayload = payload['payload'] ?? '';
        const mode = payload['mode'] ?? '';
        const resource = payload['resource'] ?? '';
        const userAgent = payload['userAgent'] ?? '';
        const ip = payload['ip'] ?? '';
        const user = new Document(payload['user'] ?? {});

        const userName = user.getAttribute('name', '');
        const userEmail = user.getAttribute('email', '');

        const audit = new Audit(dbForProject);
        await audit.log(
            user.getInternalId(),
            event,
            resource,
            userAgent,
            ip,
            '',
            {
                userId: user.getId(),
                userName: userName,
                userEmail: userEmail,
                mode: mode,
                data: auditPayload,
            }
        );
    }
}