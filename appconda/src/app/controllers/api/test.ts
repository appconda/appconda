import path from "path";
import { Response } from "../../../Appconda/Tuval/Response";
import { App } from "../../../Tuval/Http";


App
    .init()
    .inject('appconda')
    .inject('request')
    .action((app: App, request: Request) => {
        console.log('Module Test Yuklendi');
    })

App
    .get('/v1/test')
    .desc('Get all users')
    //.groups(['api', 'account', 'auth'])
    .label('event', 'users.[userId].create')
    .label('scope', 'sessions.write')
    .label('auth.type', 'anonymous')
    .label('audits.event', 'user.create')
    .label('audits.resource', 'user/{response.$id}')
    .label('audits.userId', '{response.$id}')
    .label('error', path.resolve(__dirname , '../../views/general/error.phtml'))
    .label('sdk.auth', [])
    .label('sdk.namespace', 'account')
    .label('sdk.method', 'create')
    .label('sdk.description', '/docs/references/account/create.md')
    .label('sdk.response.code', Response.STATUS_CODE_CREATED)
    .label('sdk.response.type', Response.CONTENT_TYPE_JSON)
    // .label('sdk.response.model', Response.MODEL_USER)
    .label('abuse-limit', 10)
    .inject('request')
    .inject('response')
    .action(async (req: Request, res: Response) => {

        res.send('Hello World from test');
    });