import { AppcondaException as Exception } from "../../../Appconda/Extend/Exception";
import { Config } from "../../../Tuval/Config";
import { promises as fs } from 'fs';
import { Image } from "../../../Tuval/Image/Image";
import { Response } from "../../../Appconda/Tuval/Response";
import { Database, UID } from "../../../Tuval/Database";
import { Authorization, Boolean, Document, HexColor, Range, Text, URLValidator, WhiteList } from "../../../Tuval/Core";
import { DateTime } from 'luxon';
import { App } from "../../../Tuval/Http";
import { APP_AUTH_TYPE_JWT, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_SESSION, APP_EMAIL_SECURITY, APP_USERAGENT } from "../../init";
import { Domain } from "../../../Tuval/Domains";
import { Client } from "../../../Tuval/Fetch/Client";
import QRCode from 'qrcode';
import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';


async function isReadable(path: string): Promise<boolean> {
    try {
        await fs.access(path, fs.constants.R_OK);
        return true; // The directory is readable
    } catch (error) {
        return false; // The directory is not readable
    }
}



const avatarCallback = async (
    type: string,
    code: string,
    width: number,
    height: number,
    quality: number,
    response: Response
) => {
    code = code.toLowerCase();
    type = type.toLowerCase();
    const set = Config.getParam(`avatar-${type}`, []);

    if (!set || Object.keys(set).length === 0) {
        throw new Exception(Exception.AVATAR_SET_NOT_FOUND);
    }

    if (!(code in set)) {
        throw new Exception(Exception.AVATAR_NOT_FOUND);
    }

    if (!('imagick' in global)) { // Check if Imagick is available
        throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Imagick extension is missing');
    }

    const outputFormat = 'png';
    const path = set[code].path;
    const outputType = 'png';

    if (!await isReadable(path)) { // Assuming isReadable is defined elsewhere
        throw new Exception(Exception.GENERAL_SERVER_ERROR, `File not readable in ${path}`);
    }

    const imageData = await fs.readFile(path); // Using fs to read the file
    const image = new Image(imageData); // Assuming Image class is defined elsewhere
    image.crop(width, height);
    const data = image.output(outputFormat, quality);

    response
        .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toUTCString())
        .setContentType('image/png')
        .file(data as any);
};

// Helper functions
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const classExists = (className: string) => {
    try {
        require.resolve(className);
        return true;
    } catch {
        return false;
    }
};

const getUserGitHub = async (
    userId: string,
    project: Document,
    dbForProject: Database,
    dbForConsole: Database,
    logger?: Logger
): Promise<{ name: string; id: string } | {}> => {
    try {
        const user = await Authorization.skip(async () => await dbForConsole.getDocument('users', userId));

        const sessions = user.getAttribute('sessions', []);
        let gitHubSession: Document | null = null;

        for (const session of sessions) {
            if (session.getAttribute('provider', '') === 'github') {
                gitHubSession = session;
                break;
            }
        }

        if (!gitHubSession) {
            throw new Exception(Exception.USER_SESSION_NOT_FOUND, 'GitHub session not found.');
        }

        const provider = gitHubSession.getAttribute('provider', '');
        let accessToken = gitHubSession.getAttribute('providerAccessToken');
        const accessTokenExpiry = gitHubSession.getAttribute('providerAccessTokenExpiry');
        const refreshToken = gitHubSession.getAttribute('providerRefreshToken');

        const appId = project.getAttribute('oAuthProviders', {})[`${provider}Appid`] || '';
        const appSecret = project.getAttribute('oAuthProviders', {})[`${provider}Secret`] || '{}';

        const className = `Appconda.Auth.OAuth2.${capitalize(provider)}`;

        if (!classExists(className)) {
            throw new Exception(Exception.PROJECT_PROVIDER_UNSUPPORTED);
        }

        const oauth2 = new (require(className))(appId, appSecret, '', [], []);

        const isExpired = DateTime.fromISO(accessTokenExpiry) < DateTime.now();
        if (isExpired) {
            try {
                await oauth2.refreshTokens(refreshToken);

                accessToken = await oauth2.getAccessToken('');
                const newRefreshToken = await oauth2.getRefreshToken('');
                const verificationId = await oauth2.getUserID(accessToken);

                if (!verificationId) {
                    throw new Error("Locked tokens."); // Race condition, handled in catch
                }

                gitHubSession
                    .setAttribute('providerAccessToken', accessToken)
                    .setAttribute('providerRefreshToken', newRefreshToken)
                    .setAttribute('providerAccessTokenExpiry', DateTime.now().plus({ seconds: await oauth2.getAccessTokenExpiry('') }).toISO());

                await Authorization.skip(() => dbForProject.updateDocument('sessions', gitHubSession.getId(), gitHubSession));
                await dbForProject.purgeCachedDocument('users', user.getId());
            } catch (err) {
                let index = 0;
                do {
                    const previousAccessToken = gitHubSession.getAttribute('providerAccessToken');

                    const user = await Authorization.skip(() => dbForConsole.getDocument('users', userId));
                    const sessions = user.getAttribute('sessions', []);

                    gitHubSession = new Document();
                    for (const session of sessions) {
                        if (session.getAttribute('provider', '') === 'github') {
                            gitHubSession = session;
                            break;
                        }
                    }

                    accessToken = gitHubSession.getAttribute('providerAccessToken');

                    if (accessToken !== previousAccessToken) {
                        break;
                    }

                    index++;
                    await new Promise(resolve => setTimeout(resolve, 500)); // Sleep for 500ms
                } while (index < 10);
            }
        }

        const githubUser = await oauth2.getUserSlug(accessToken);
        const githubId = await oauth2.getUserID(accessToken);

        return {
            name: githubUser,
            id: githubId
        };
    } catch (error) {
        return {};
    }
};


App.get('/v1/avatars/credit-cards/:code')
    .desc('Get credit card icon')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resource', 'avatar/credit-card')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'avatars')
    .label('sdk.method', 'getCreditCard')
    .label('sdk.methodType', 'location')
    .label('sdk.description', '/docs/references/avatars/get-credit-card.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE_PNG)
    .param('code', '', new WhiteList(Object.keys(Config.getParam('avatar-credit-cards'))), 'Credit Card Code. Possible values: ' + Object.keys(Config.getParam('avatar-credit-cards')).join(', ') + '.')
    .param('width', 100, new Range(0, 2000), 'Image width. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('height', 100, new Range(0, 2000), 'Image height. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('quality', 100, new Range(0, 100), 'Image quality. Pass an integer between 0 to 100. Defaults to 100.', true)
    .inject('response')
    .action((code: string, width: number, height: number, quality: number, response: Response) => {
        avatarCallback('credit-cards', code, width, height, quality, response);
    });


App.get('/v1/avatars/browsers/:code')
    .desc('Get browser icon')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resource', 'avatar/browser')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'avatars')
    .label('sdk.method', 'getBrowser')
    .label('sdk.methodType', 'location')
    .label('sdk.description', '/docs/references/avatars/get-browser.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE_PNG)
    .param('code', '', new WhiteList(Object.keys(Config.getParam('avatar-browsers'))), 'Browser Code.')
    .param('width', 100, new Range(0, 2000), 'Image width. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('height', 100, new Range(0, 2000), 'Image height. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('quality', 100, new Range(0, 100), 'Image quality. Pass an integer between 0 to 100. Defaults to 100.', true)
    .inject('response')
    .action((code: string, width: number, height: number, quality: number, response: Response) => {
        avatarCallback('browsers', code, width, height, quality, response);
    });


App.get('/v1/avatars/flags/:code')
    .desc('Get country flag')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resource', 'avatar/flag')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'avatars')
    .label('sdk.method', 'getFlag')
    .label('sdk.methodType', 'location')
    .label('sdk.description', '/docs/references/avatars/get-flag.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE_PNG)
    .param('code', '', new WhiteList(Object.keys(Config.getParam('avatar-flags'))), 'Country Code. ISO Alpha-2 country code format.')
    .param('width', 100, new Range(0, 2000), 'Image width. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('height', 100, new Range(0, 2000), 'Image height. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('quality', 100, new Range(0, 100), 'Image quality. Pass an integer between 0 to 100. Defaults to 100.', true)
    .inject('response')
    .action((code: string, width: number, height: number, quality: number, response: Response) => {
        avatarCallback('flags', code, width, height, quality, response);
    });


App.get('/v1/avatars/image')
    .desc('Get image from URL')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resource', 'avatar/image')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'avatars')
    .label('sdk.method', 'getImage')
    .label('sdk.methodType', 'location')
    .label('sdk.description', '/docs/references/avatars/get-image.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE)
    .param('url', '', new URLValidator(['http', 'https']), 'Image URL which you want to crop.')
    .param('width', 400, new Range(0, 2000), 'Resize preview image width, Pass an integer between 0 to 2000. Defaults to 400.', true)
    .param('height', 400, new Range(0, 2000), 'Resize preview image height, Pass an integer between 0 to 2000. Defaults to 400.', true)
    .inject('response')
    .action(async (url: string, width: number, height: number, response: Response) => {

        const quality = 80;
        let output = 'png';
        const type = 'png';

        if (!('imagick' in global)) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Imagick extension is missing');
        }

        const domain = new Domain(new URL(url).hostname);

        if (!domain.isKnown()) {
            throw new Exception(Exception.AVATAR_REMOTE_URL_FAILED);
        }

        const client = new Client();
        let res;
        try {
            res = await client.setAllowRedirects(false).fetch(url);
        } catch (error) {
            throw new Exception(Exception.AVATAR_REMOTE_URL_FAILED);
        }

        if (res.getStatusCode() !== 200) {
            throw new Exception(Exception.AVATAR_IMAGE_NOT_FOUND);
        }

        let image;
        try {
            image = new Image(res.getBody());
        } catch (error) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Unable to parse image');
        }

        image.crop(width, height);
        output = output || type;
        const data = image.output(output, quality);

        response
            .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toUTCString())
            .setContentType('image/png')
            .file(data);
    });

App.get('/v1/avatars/favicon')
    .desc('Get favicon')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resource', 'avatar/favicon')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'avatars')
    .label('sdk.method', 'getFavicon')
    .label('sdk.methodType', 'location')
    .label('sdk.description', '/docs/references/avatars/get-favicon.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE)
    .param('url', '', new URLValidator(['http', 'https']), 'Website URL which you want to fetch the favicon from.')
    .inject('response')
    .action(async (url: string, response: Response) => {

        const width = 56;
        const height = 56;
        const quality = 80;
        let output = 'png';
        const type = 'png';

        if (!('imagick' in global)) {
            throw new Exception(Exception.GENERAL_SERVER_ERROR, 'Imagick extension is missing');
        }

        const domain = new Domain(new URL(url).hostname);

        if (!domain.isKnown()) {
            throw new Exception(Exception.AVATAR_REMOTE_URL_FAILED);
        }

        const client = new Client();
        let res;
        try {
            res = await client
                .setAllowRedirects(false)
                .setUserAgent(`${APP_USERAGENT} ${process.env._APP_VERSION || 'UNKNOWN'} ${process.env._APP_EMAIL_SECURITY || process.env._APP_SYSTEM_SECURITY_EMAIL_ADDRESS || APP_EMAIL_SECURITY}`)
                .fetch(url);
        } catch (error) {
            throw new Exception(Exception.AVATAR_REMOTE_URL_FAILED);
        }

        if (res.getStatusCode() !== 200) {
            throw new Exception(Exception.AVATAR_REMOTE_URL_FAILED);
        }

        const doc = new DOMParser().parseFromString(res.getBody(), 'text/html');
        const links = doc.getElementsByTagName('link');
        let outputHref = '';
        let outputExt = '';
        let space = 0;

        for (const link of links) {
            const href = link.getAttribute('href');
            const rel = link.getAttribute('rel');
            const sizes = link.getAttribute('sizes');
            const absolute = new URL(href, url).toString();

            switch (rel.toLowerCase()) {
                case 'icon':
                case 'shortcut icon':
                    const ext = absolute.split('.').pop();

                    switch (ext) {
                        case 'ico':
                        case 'png':
                        case 'jpg':
                        case 'jpeg':
                            const size = sizes.toLowerCase().split('x');
                            const sizeWidth = parseInt(size[0] || '0', 10);
                            const sizeHeight = parseInt(size[1] || '0', 10);

                            if ((sizeWidth * sizeHeight) >= space) {
                                space = sizeWidth * sizeHeight;
                                outputHref = absolute;
                                outputExt = ext;
                            }
                            break;
                    }
                    break;
            }
        }

        if (!outputHref || !outputExt) {
            const defaultUrl = new URL(url);
            outputHref = `${defaultUrl.protocol}//${defaultUrl.hostname}/favicon.ico`;
            outputExt = 'ico';
        }

        const faviconDomain = new Domain(new URL(outputHref).hostname);

        if (!faviconDomain.isKnown()) {
            throw new Exception(Exception.AVATAR_REMOTE_URL_FAILED);
        }

        try {
            res = await client.setAllowRedirects(false).fetch(outputHref);
        } catch (error) {
            throw new Exception(Exception.AVATAR_REMOTE_URL_FAILED);
        }

        if (res.getStatusCode() !== 200) {
            throw new Exception(Exception.AVATAR_ICON_NOT_FOUND);
        }

        let data = res.getBody();

        if (outputExt === 'ico') {
            if (!data || data.startsWith('<html') || data.startsWith('<!doc')) {
                throw new Exception(Exception.AVATAR_ICON_NOT_FOUND, 'Favicon not found');
            }
            response
                .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toUTCString())
                .setContentType('image/x-icon')
                .file(data);
            return;
        }

        const image = new Image(data);
        image.crop(width, height);
        data = image.output(output, quality);

        response
            .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 30 * 1000).toUTCString())
            .setContentType('image/png')
            .file(data);
    });

App.get('/v1/avatars/qr')
    .desc('Get QR code')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'avatars')
    .label('sdk.method', 'getQR')
    .label('sdk.methodType', 'location')
    .label('sdk.description', '/docs/references/avatars/get-qr.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE_PNG)
    .param('text', '', new Text(512), 'Plain text to be converted to QR code image.')
    .param('size', 400, new Range(1, 1000), 'QR code size. Pass an integer between 1 to 1000. Defaults to 400.', true)
    .param('margin', 1, new Range(0, 10), 'Margin from edge. Pass an integer between 0 to 10. Defaults to 1.', true)
    .param('download', false, new Boolean(true), 'Return resulting image with \'Content-Disposition: attachment \' headers for the browser to start downloading it. Pass 0 for no header, or 1 for otherwise. Default value is set to 0.', true)
    .inject('response')
    .action(async (text: string, size: number, margin: number, download: boolean, response: Response) => {

        download = ((download as any) === '1' || (download as any) === 'true' || (download as any) === 1 || download === true);

        const options = {
            margin: margin,
            width: size,
            type: 'image/png'
        };

        try {
            const qrDataUrl = await QRCode.toDataURL(text, options);

            if (download) {
                response.addHeader('Content-Disposition', 'attachment; filename="qr.png"');
            }

            const imageData = qrDataUrl.split(',')[1]; // Extract base64 data
            const buffer = Buffer.from(imageData, 'base64');

            response
                .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 45 * 1000).toUTCString()) // 45 days cache
                .setContentType('image/png')
                .send(buffer as any);
        } catch (err) {
            throw new Error('Failed to generate QR code');
        }
    });


App.get('/v1/avatars/initials')
    .desc('Get user initials')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache.resource', 'avatar/initials')
    .label('sdk.auth', [APP_AUTH_TYPE_SESSION, APP_AUTH_TYPE_KEY, APP_AUTH_TYPE_JWT])
    .label('sdk.namespace', 'avatars')
    .label('sdk.method', 'getInitials')
    .label('sdk.methodType', 'location')
    .label('sdk.description', '/docs/references/avatars/get-initials.md')
    .label('sdk.response.code', Response.STATUS_CODE_OK)
    .label('sdk.response.type', Response.CONTENT_TYPE_IMAGE_PNG)
    .param('name', '', new Text(128), 'Full Name. When empty, current user name or email will be used. Max length: 128 chars.', true)
    .param('width', 500, new Range(0, 2000), 'Image width. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('height', 500, new Range(0, 2000), 'Image height. Pass an integer between 0 to 2000. Defaults to 100.', true)
    .param('background', '', new HexColor(), 'Changes background color. By default a random color will be picked and stay will persistent to the given name.', true)
    .inject('response')
    .inject('user')
    .action(async (name: string, width: number, height: number, background: string, response: Response, user: Document) => {

        const themes = [
            { background: '#FD366E' }, // Default (Pink)
            { background: '#FE9567' }, // Orange
            { background: '#7C67FE' }, // Purple
            { background: '#68A3FE' }, // Blue
            { background: '#85DBD8' }, // Mint
        ];

        name = name || user.getAttribute('name', user.getAttribute('email', ''));
        const words = name.toUpperCase().split(' ').length === 1 ? name.toUpperCase().split('_') : name.toUpperCase().split(' ');

        let initials = '';
        let code = 0;

        words.forEach((w, key) => {
            if (w[0] && /[a-zA-Z0-9]/.test(w[0])) {
                initials += w[0];
                code += w.charCodeAt(0);

                if (key === 1) {
                    return;
                }
            }
        });

        let rand = code % themes.length;
        background = background ? `#${background}` : themes[rand].background;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${Math.min(width, height) / 2}px "Inter"`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, width / 2, height / 2);

        try {
            const buffer = canvas.toBuffer('image/png');
        }
        catch (e) {
            console.log(e);
        }


        response
            .addHeader('Expires', new Date(Date.now() + 60 * 60 * 24 * 45 * 1000).toUTCString()) // 45 days cache
            .setContentType('image/png')
            .text('aa');
    });


App.get('/v1/cards/cloud')
    .desc('Get Front Of Cloud Card')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resourceType', 'cards/cloud')
    .label('cache.resource', 'card/{request.userId}')
    .label('docs', false)
    .label('origin', '*')
    .param('userId', '', new UID(), 'User ID.', true)
    .param('mock', '', new WhiteList(['employee', 'employee-2digit', 'hero', 'contributor', 'normal', 'platinum', 'normal-no-github', 'normal-long']), 'Mocking behaviour.', true)
    .param('width', 0, new Range(0, 512), 'Resize image width, Pass an integer between 0 to 512.', true)
    .param('height', 0, new Range(0, 320), 'Resize image height, Pass an integer between 0 to 320.', true)
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('dbForConsole')
    .inject('response')
    .inject('heroes')
    .inject('contributors')
    .inject('employees')
    .inject('logger')
    .action(async (userId: string, mock: string, width: number, height: number, user: Document, project: Document, dbForProject: Database, dbForConsole: Database, response: Response, heroes: any[], contributors: any[], employees: any[], logger?: Logger) => {
        // Fetch user data
        user = await Authorization.skip(() => dbForConsole.getDocument('users', userId));

        if (user.isEmpty() && !mock) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        let name, email, createdAt, githubName, githubId, isHero, isContributor, isEmployee, employeeNumber, isPlatinum;

        if (!mock) {
            name = user.getAttribute('name', 'Anonymous');
            email = user.getAttribute('email', '');
            createdAt = new Date(user.getCreatedAt());

            const gitHub: any = await getUserGitHub(user.getId(), project, dbForProject, dbForConsole, logger);
            githubName = gitHub.name || '';
            githubId = gitHub.id || '';

            isHero = heroes.hasOwnProperty(email);
            isContributor = contributors.includes(githubId);
            isEmployee = employees.hasOwnProperty(email);
            employeeNumber = isEmployee ? employees[email].spot : '';

            if (isHero) {
                createdAt = new Date(heroes[email].memberSince || '');
            } else if (isEmployee) {
                createdAt = new Date(employees[email].memberSince || '');
            }

            if (!isEmployee && githubName) {
                const employeeGitHub = Object.keys(employees).find(key => employees[key].gitHub.toLowerCase() === githubName.toLowerCase());
                if (employeeGitHub) {
                    isEmployee = true;
                    employeeNumber = employees[employeeGitHub].spot;
                    createdAt = new Date(employees[employeeGitHub].memberSince || '');
                }
            }

            isPlatinum = Number.parseInt(user.getInternalId()) % 100 === 0;
        } else {
            // Mock data handling
            name = mock === 'normal-long' ? 'Sir First Walter O\'Brian Junior' : 'Walter O\'Brian';
            createdAt = new Date();
            githubName = mock === 'normal-no-github' ? '' : (mock === 'normal-long' ? 'sir-first-walterobrian-junior' : 'walterobrian');
            isHero = mock === 'hero';
            isContributor = mock === 'contributor';
            isEmployee = mock.startsWith('employee');
            employeeNumber = mock === 'employee' ? '1' : (mock === 'employee-2digit' ? '18' : '');
            isPlatinum = mock === 'platinum';
        }

        if (isEmployee) {
            isContributor = false;
            isHero = false;
        }

        if (isHero) {
            isContributor = false;
            isEmployee = false;
        }

        if (isContributor) {
            isHero = false;
            isEmployee = false;
        }

        const isGolden = isEmployee || isHero || isContributor;
        isPlatinum = isGolden ? false : isPlatinum;
        const memberSince = `Member since ${createdAt.toLocaleString('en-US', { month: 'short' })} ${createdAt.getDate()}, ${createdAt.getFullYear()}`.toUpperCase();

        const imagePath = isGolden ? 'front-golden.png' : (isPlatinum ? 'front-platinum.png' : 'front.png');
        const baseImage = await loadImage(__dirname + '/../../../public/images/cards/cloud/' + imagePath);

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImage, 0, 0);

        if (isEmployee) {
            const employeeImage = await loadImage(__dirname + '/../../../public/images/cards/cloud/employee.png');
            ctx.drawImage(employeeImage, 793, 35);

            ctx.font = `${employeeNumber.length <= 2 ? 54 : 48}px "Inter-Bold"`;
            ctx.fillStyle = '#FFFADF';
            ctx.textAlign = 'center';
            ctx.fillText('#' + employeeNumber, 898, 150);
        }

        if (isContributor) {
            const contributorImage = await loadImage(__dirname + '/../../../public/images/cards/cloud/contributor.png');
            ctx.drawImage(contributorImage, 793, 34);
        }

        if (isHero) {
            const heroImage = await loadImage(__dirname + '/../../../public/images/cards/cloud/hero.png');
            ctx.drawImage(heroImage, 793, 34);
        }

        ctx.font = `${name.length <= 23 ? 80 : 54}px "Inter-Bold"`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(name, 512, 477);

        ctx.font = '27px "Inter-SemiBold"';
        ctx.fillStyle = isGolden || isPlatinum ? '#FFFFFF' : '#FFB9CC';
        ctx.fillText(memberSince, 512, 541);

        if (githubName) {
            ctx.font = `${name.length <= 23 ? 32 : 28}px "Inter-Regular"`;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(githubName, 512 + 20 + 4, 373 + (name.length > 23 ? 2 : 0));

            const githubImage = await loadImage(__dirname + '/../../../public/images/cards/cloud/github.png');
            ctx.drawImage(githubImage, 512 - ctx.measureText(githubName).width / 2 - 20 - 4, 373 - 5);
        }

        if (width || height) {
            const resizedCanvas = createCanvas(width || canvas.width, height || canvas.height);
            const resizedCtx = resizedCanvas.getContext('2d');
            resizedCtx.drawImage(canvas, 0, 0, width || canvas.width, height || canvas.height);
            response.setContentType('image/png').send(resizedCanvas.toBuffer() as any);
        } else {
            response.setContentType('image/png').send(canvas.toBuffer() as any);
        }
    });


App.get('/v1/cards/cloud-back')
    .desc('Get Back Of Cloud Card')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resourceType', 'cards/cloud-back')
    .label('cache.resource', 'card-back/{request.userId}')
    .label('docs', false)
    .label('origin', '*')
    .param('userId', '', new UID(), 'User ID.', true)
    .param('mock', '', new WhiteList(['golden', 'normal', 'platinum']), 'Mocking behaviour.', true)
    .param('width', 0, new Range(0, 512), 'Resize image width, Pass an integer between 0 to 512.', true)
    .param('height', 0, new Range(0, 320), 'Resize image height, Pass an integer between 0 to 320.', true)
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('dbForConsole')
    .inject('response')
    .inject('heroes')
    .inject('contributors')
    .inject('employees')
    .inject('logger')
    .action(async (userId: string, mock: string, width: number, height: number, user: Document, project: Document, dbForProject: Database, dbForConsole: Database, response: Response, heroes: any[], contributors: any[], employees: any[], logger?: Logger) => {
        // Fetch user data
        user = await Authorization.skip(() => dbForConsole.getDocument('users', userId));

        if (user.isEmpty() && !mock) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        let isGolden, isPlatinum;

        if (!mock) {
            userId = user.getId();
            const email = user.getAttribute('email', '');

            const gitHub: any = await getUserGitHub(user.getId(), project, dbForProject, dbForConsole, logger);
            const githubId = gitHub.id || '';

            const isHero = heroes.hasOwnProperty(email);
            const isContributor = contributors.includes(githubId);
            const isEmployee = employees.hasOwnProperty(email);

            isGolden = isEmployee || isHero || isContributor;
            isPlatinum = Number.parseInt(user.getInternalId()) % 100 === 0;
        } else {
            userId = '63e0bcf3c3eb803ba530';

            isGolden = mock === 'golden';
            isPlatinum = mock === 'platinum';
        }

        userId = 'UID ' + userId;

        isPlatinum = isGolden ? false : isPlatinum;

        const imagePath = isGolden ? 'back-golden.png' : (isPlatinum ? 'back-platinum.png' : 'back.png');
        const baseImage = await loadImage(__dirname + '/../../../public/images/cards/cloud/' + imagePath);

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImage, 0, 0);

        ctx.font = '28px "Source Code Pro"';
        ctx.fillStyle = isGolden ? '#664A1E' : (isPlatinum ? '#555555' : '#E8E9F0');
        ctx.textAlign = 'center';
        ctx.fillText(userId, 512, 596);

        if (width || height) {
            const resizedCanvas = createCanvas(width || canvas.width, height || canvas.height);
            const resizedCtx = resizedCanvas.getContext('2d');
            resizedCtx.drawImage(canvas, 0, 0, width || canvas.width, height || canvas.height);
            response.setContentType('image/png').send(resizedCanvas.toBuffer() as any);
        } else {
            response.setContentType('image/png').send(canvas.toBuffer() as any);
        }
    });


App.get('/v1/cards/cloud-og')
    .desc('Get OG Image From Cloud Card')
    .groups(['api', 'avatars'])
    .label('scope', 'avatars.read')
    .label('cache', true)
    .label('cache.resourceType', 'cards/cloud-og')
    .label('cache.resource', 'card-og/{request.userId}')
    .label('docs', false)
    .label('origin', '*')
    .param('userId', '', new UID(), 'User ID.', true)
    .param('mock', '', new WhiteList(['employee', 'employee-2digit', 'hero', 'contributor', 'normal', 'platinum', 'normal-no-github', 'normal-long', 'normal-long-right', 'normal-long-middle', 'normal-bg2', 'normal-bg3', 'normal-right', 'normal-middle', 'platinum-right', 'platinum-middle', 'hero-middle', 'hero-right', 'contributor-right', 'employee-right', 'contributor-middle', 'employee-middle', 'employee-2digit-middle', 'employee-2digit-right']), 'Mocking behaviour.', true)
    .param('width', 0, new Range(0, 1024), 'Resize image card width, Pass an integer between 0 to 1024.', true)
    .param('height', 0, new Range(0, 1024), 'Resize image card height, Pass an integer between 0 to 1024.', true)
    .inject('user')
    .inject('project')
    .inject('dbForProject')
    .inject('dbForConsole')
    .inject('response')
    .inject('heroes')
    .inject('contributors')
    .inject('employees')
    .inject('logger')
    .action(async (userId: string, mock: string, width: number, height: number, user: Document, project: Document, dbForProject: Database, dbForConsole: Database, response: Response, heroes: any[], contributors: any[], employees: any[], logger?: Logger) => {
        // Fetch user data
        user = await Authorization.skip(() => dbForConsole.getDocument('users', userId));

        if (user.isEmpty() && !mock) {
            throw new Exception(Exception.USER_NOT_FOUND);
        }

        let bgVariation, cardVariation, name, createdAt, githubName, isHero, isContributor, isEmployee, employeeNumber, isPlatinum;

        if (!mock) {
            const internalId: any = user.getInternalId();
            bgVariation = internalId % 3 === 0 ? '1' : (internalId % 3 === 1 ? '2' : '3');
            cardVariation = internalId % 3 === 0 ? '1' : (internalId % 3 === 1 ? '2' : '3');

            name = user.getAttribute('name', 'Anonymous');
            const email = user.getAttribute('email', '');
            createdAt = new Date(user.getCreatedAt());

            const gitHub: any = await getUserGitHub(user.getId(), project, dbForProject, dbForConsole, logger);
            githubName = gitHub.name || '';
            const githubId = gitHub.id || '';

            isHero = heroes.hasOwnProperty(email);
            isContributor = contributors.includes(githubId);
            isEmployee = employees.hasOwnProperty(email);
            employeeNumber = isEmployee ? employees[email].spot : '';

            if (isHero) {
                createdAt = new Date(heroes[email].memberSince || '');
            } else if (isEmployee) {
                createdAt = new Date(employees[email].memberSince || '');
            }

            if (!isEmployee && githubName) {
                const employeeGitHub = Object.keys(employees).find(key => employees[key].gitHub.toLowerCase() === githubName.toLowerCase());
                if (employeeGitHub) {
                    isEmployee = true;
                    employeeNumber = employees[employeeGitHub].spot;
                    createdAt = new Date(employees[employeeGitHub].memberSince || '');
                }
            }

            isPlatinum = Number.parseInt(user.getInternalId()) % 100 === 0;
        } else {
            bgVariation = mock.endsWith('-bg2') ? '2' : (mock.endsWith('-bg3') ? '3' : '1');
            cardVariation = mock.endsWith('-right') ? '2' : (mock.endsWith('-middle') ? '3' : '1');
            name = mock.startsWith('normal-long') ? 'Sir First Walter O\'Brian Junior' : 'Walter O\'Brian';
            createdAt = new Date();
            githubName = mock === 'normal-no-github' ? '' : (mock.startsWith('normal-long') ? 'sir-first-walterobrian-junior' : 'walterobrian');
            isHero = mock.startsWith('hero');
            isContributor = mock.startsWith('contributor');
            isEmployee = mock.startsWith('employee');
            employeeNumber = mock === 'employee' || mock === 'employee-right' || mock === 'employee-middle' ? '1' : (mock === 'employee-2digit' || mock === 'employee-2digit-right' || mock === 'employee-2digit-middle' ? '18' : '');
            isPlatinum = mock.startsWith('platinum');
        }

        if (isEmployee) {
            isContributor = false;
            isHero = false;
        }

        if (isHero) {
            isContributor = false;
            isEmployee = false;
        }

        if (isContributor) {
            isHero = false;
            isEmployee = false;
        }

        const isGolden = isEmployee || isHero || isContributor;
        isPlatinum = isGolden ? false : isPlatinum;
        const memberSince = `Member since ${createdAt.toLocaleString('en-US', { month: 'short' })} ${createdAt.getDate()}, ${createdAt.getFullYear()}`.toUpperCase();

        const baseImage = await loadImage(__dirname + `/../../../public/images/cards/cloud/og-background${bgVariation}.png`);

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImage, 0, 0);

        const cardType = isGolden ? '-golden' : (isPlatinum ? '-platinum' : '');
        const cardImage = await loadImage(__dirname + `/../../../public/images/cards/cloud/og-card${cardType}${cardVariation}.png`);
        ctx.drawImage(cardImage, 1008 / 2 - cardImage.width / 2, 1008 / 2 - cardImage.height / 2);

        const imageLogo = await loadImage(__dirname + '/../../../public/images/cards/cloud/og-background-logo.png');
        const imageShadow = await loadImage(__dirname + `/../../../public/images/cards/cloud/og-shadow${cardType}.png`);
        if (cardVariation === '1') {
            ctx.drawImage(imageLogo, 32, 1008 - imageLogo.height - 32);
            ctx.drawImage(imageShadow, -450, 700);
        } else if (cardVariation === '2') {
            ctx.drawImage(imageLogo, 1008 - imageLogo.width - 32, 1008 - imageLogo.height - 32);
            ctx.drawImage(imageShadow, -20, 710);
        } else {
            ctx.drawImage(imageLogo, 1008 - imageLogo.width - 32, 1008 - imageLogo.height - 32);
            ctx.drawImage(imageShadow, -135, 710);
        }

        if (isEmployee) {
            const file = cardVariation === '3' ? 'employee-skew.png' : 'employee.png';
            const employeeImage = await loadImage(__dirname + `/../../../public/images/cards/cloud/${file}`);
            ctx.drawImage(employeeImage, 640, 293);

            ctx.font = `${employeeNumber.length <= 1 ? 36 : 28}px "Inter-Bold"`;
            ctx.fillStyle = '#FFFADF';
            ctx.textAlign = 'left';
            ctx.fillText(`#${employeeNumber}`, 670, 317);
        }

        if (isContributor) {
            const file = cardVariation === '3' ? 'contributor-skew.png' : 'contributor.png';
            const contributorImage = await loadImage(__dirname + `/../../../public/images/cards/cloud/${file}`);
            ctx.drawImage(contributorImage, 640, 293);
        }

        if (isHero) {
            const file = cardVariation === '3' ? 'hero-skew.png' : 'hero.png';
            const heroImage = await loadImage(__dirname + `/../../../public/images/cards/cloud/${file}`);
            ctx.drawImage(heroImage, 640, 293);
        }

        ctx.font = `${name.length <= 23 ? 44 : 32}px "Inter-Bold"`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(name, 512, 477);

        ctx.font = '16px "Inter-Medium"';
        ctx.fillStyle = isGolden || isPlatinum ? '#FFFFFF' : '#FFB9CC';
        ctx.fillText(memberSince, 512, 541);

        if (githubName) {
            ctx.font = `${name.length <= 23 ? 20 : 16}px "Inter-Regular"`;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(githubName, 512 + 15 + 2, 640);

            const githubImage = await loadImage(__dirname + '/../../../public/images/cards/cloud/github-skew.png');
            ctx.drawImage(githubImage, 512 - ctx.measureText(githubName).width / 2, 518 + githubName.length * 1.3);
        }

        if (width || height) {
            const resizedCanvas = createCanvas(width || canvas.width, height || canvas.height);
            const resizedCtx = resizedCanvas.getContext('2d');
            resizedCtx.drawImage(canvas, 0, 0, width || canvas.width, height || canvas.height);
            response.setContentType('image/png').send(resizedCanvas.toBuffer() as any);
        } else {
            response.setContentType('image/png').send(canvas.toBuffer() as any);
        }
    });