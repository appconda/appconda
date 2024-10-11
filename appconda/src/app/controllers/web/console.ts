import { Request } from "../../../Appconda/Tuval/Request";
import { Response } from "../../../Appconda/Tuval/Response";
import { App } from "../../../Tuval/Http/App";
import { parse } from "url";

App.init()
    .groups(['web'])
    .inject('request')
    .inject('response')
    .action((request: Request, response: Response) => {
        response
            .addHeader('X-Frame-Options', 'SAMEORIGIN')
            .addHeader('X-XSS-Protection', '1; mode=block; report=/v1/xss?url=' + encodeURIComponent(request.getURI()))
            .addHeader('X-UA-Compatible', 'IE=Edge');
    });


App.get('/*')
   // .alias('/')
    /*  .alias('auth/*')
     .alias('/invite')
     .alias('/login')
     .alias('/mfa')
     .alias('/card/*')
     .alias('/recover')
     .alias('/register/*') */
    .groups(['web'])
    .label('permission', 'public')
    .label('scope', 'home')
    .inject('request')
    .inject('response')
    .action((request: Request, response: Response) => {
        const fs = require('fs');
        const path = require('path');
        const fallback = fs.readFileSync(path.join(__dirname, '../../console/index.html'), 'utf8');

        // Card SSR
        if (request.getURI().startsWith('/card')) {
            const urlChunks = request.getURI().split('/');
            const userId = urlChunks[urlChunks.length - 1] || '';

            const domain = `${request.getProtocol()}://${request.getHostname()}`;

            const ogImageUrl = userId
                ? `${domain}/v1/cards/cloud-og?userId=${userId}`
                : `${domain}/v1/cards/cloud-og?mock=normal`;

            const ogTags = [
                '<title>Appconda Cloud Card</title>',
                '<meta name="description" content="Appconda Cloud is now LIVE! Share your Cloud card for a chance to win an exclusive Cloud hoodie!">',
                `<meta property="og:url" content="${domain}${request.getURI()}">`,
                '<meta name="og:image:type" content="image/png">',
                '<meta name="og:image:width" content="1008">',
                '<meta name="og:image:height" content="1008">',
                '<meta property="og:type" content="website">',
                '<meta property="og:title" content="Appconda Cloud Card">',
                '<meta property="og:description" content="Appconda Cloud is now LIVE! Share your Cloud card for a chance to win an exclusive Cloud hoodie!">',
                `<meta property="og:image" content="${ogImageUrl}">`,
                '<meta name="twitter:card" content="summary_large_image">',
                `<meta property="twitter:domain" content="${request.getHostname()}">`,
                `<meta property="twitter:url" content="${domain}${request.getURI()}">`,
                '<meta name="twitter:title" content="Appconda Cloud Card">',
                '<meta name="twitter:image:type" content="image/png">',
                '<meta name="twitter:image:width" content="1008">',
                '<meta name="twitter:image:height" content="1008">',
                '<meta name="twitter:description" content="Appconda Cloud is now LIVE! Share your Cloud card for a chance to win an exclusive Cloud hoodie!">',
                `<meta name="twitter:image" content="${ogImageUrl}">`,
            ];

            const updatedFallback = fallback.replace('<!-- {{CLOUD_OG}} -->', ogTags.join(''));
            response.html(updatedFallback);
        } else {
            response.html(fallback);
        }
    });