import { Response } from "../../../Appconda/Tuval/Response";
import { Document, Text } from "../../../Tuval/Core";
import { App } from "../../../Tuval/Http";
import { APP_AUTH_TYPE_ADMIN } from "../../init";


App.init()
    .groups(['console'])
    .inject('project')
    .action((project: Document) => {
        if (project.getId() !== 'console') {
            throw new Error('GENERAL_ACCESS_FORBIDDEN');
        }
    });


App.get('/v1/console/variables')
.desc('Get variables')
.groups(['api', 'projects'])
.label('scope', 'projects.read')
.label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
.label('sdk.namespace', 'console')
.label('sdk.method', 'variables')
.label('sdk.description', '/docs/references/console/variables.md')
.label('sdk.response.code', Response.STATUS_CODE_OK)
.label('sdk.response.type', Response.CONTENT_TYPE_JSON)
.label('sdk.response.model', Response.MODEL_CONSOLE_VARIABLES)
.inject('response')
.action((response: Response) => {
    const isDomainEnabled = !!process.env['_APP_DOMAIN'] &&
        !!process.env['_APP_DOMAIN_TARGET'] &&
        process.env['_APP_DOMAIN'] !== 'localhost' &&
        process.env['_APP_DOMAIN_TARGET'] !== 'localhost';

    const isVcsEnabled = !!process.env['_APP_VCS_GITHUB_APP_NAME'] &&
        !!process.env['_APP_VCS_GITHUB_PRIVATE_KEY'] &&
        !!process.env['_APP_VCS_GITHUB_APP_ID'] &&
        !!process.env['_APP_VCS_GITHUB_CLIENT_ID'] &&
        !!process.env['_APP_VCS_GITHUB_CLIENT_SECRET'];

    const isAssistantEnabled = !!process.env['_APP_ASSISTANT_OPENAI_API_KEY'];

    const variables = new Document({
        '_APP_DOMAIN_TARGET': process.env['_APP_DOMAIN_TARGET'],
        '_APP_STORAGE_LIMIT': +process.env['_APP_STORAGE_LIMIT'],
        '_APP_FUNCTIONS_SIZE_LIMIT': +process.env['_APP_FUNCTIONS_SIZE_LIMIT'],
        '_APP_USAGE_STATS': process.env['_APP_USAGE_STATS'],
        '_APP_VCS_ENABLED': isVcsEnabled,
        '_APP_DOMAIN_ENABLED': isDomainEnabled,
        '_APP_ASSISTANT_ENABLED': isAssistantEnabled
    });

    response.dynamic(variables, Response.MODEL_CONSOLE_VARIABLES);
});


App.post('/v1/console/assistant')
    .desc('Ask Query')
    .groups(['api', 'assistant'])
    .label('scope', 'assistant.read')
    .label('sdk.auth', [APP_AUTH_TYPE_ADMIN])
    .label('sdk.namespace', 'assistant')
    .label('sdk.method', 'chat')
    .label('sdk.description', '/docs/references/assistant/chat.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_TEXT)
    .label('abuse-limit', 15)
    .label('abuse-key', 'userId:{userId}')
    .param('prompt', '', new Text(2000), 'Prompt. A string containing questions asked to the AI assistant.')
    .inject('response')
    .action(async (prompt: string, response: Response) => {
        const url = 'http://appconda-assistant:3003/';
        const query = JSON.stringify({ prompt });
        const headers = { 'accept': 'text/event-stream' };

        const handleEvent = (data: string) => {
            response.chunk(data);
            return data.length;
        };

        const responseHeaders: Record<string, string> = {};

        const options: RequestInit = {
            method: 'POST',
            headers: headers,
            body: query,
            redirect: 'follow',
            signal: new AbortController().signal,
        };

        try {
            const res = await fetch(url, options);
            const reader = res.body?.getReader();

            if (reader) {
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    handleEvent(decoder.decode(value));
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }

        response.chunk('', true);
    });