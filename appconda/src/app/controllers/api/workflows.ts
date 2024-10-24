import { Hooks } from "../../../Appconda/Hooks/Hooks";
import { Response } from "../../../Appconda/Tuval/Response";
import { Database } from "../../../Tuval/Database";
import { App } from "../../../Tuval/Http";
import { APP_AUTH_TYPE_KEY } from "../../init";



App.post('/v1/workflows')
    .desc('Create workflow')
    .groups(['api', 'workflow'])
    //  .label('event', 'users.[userId].create')
    //  .label('scope', 'users.write')
    //   .label('audits.event', 'user.create')
    //  .label('audits.resource', 'user/{response.$id}')
    .label('sdk.auth', [APP_AUTH_TYPE_KEY])
    .label('sdk.namespace', 'users')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/users/create-user.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    .label('sdk.response.model', Response.MODEL_USER)
    .inject('response')
    .inject('project')
    .inject('dbForProject')
    .inject('queueForEvents')
    .inject('hooks')
    .action(async (response: Response, project: Document, dbForProject: Database, queueForEvents: Event, hooks: Hooks) => {

        response
            .setStatusCode(Response.STATUS_CODE_CREATED)
            .dynamic({} as any, Response.MODEL_USER);
    });