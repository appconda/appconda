
import { Authorization, DateTime, Document } from "../../../../Tuval/Core";
import { AppcondaException } from "../../../../Appconda/Extend/Exception";
import { Auth } from "../../../../Tuval/Auth";
import moment from 'moment';
import _default, * as maxmind from 'maxmind'
import { Request } from "../../../../Appconda/Tuval/Request";
import { App } from "../../../../Tuval/Http";


App.init()
    .groups(['mfaProtected'])
    .inject('session')
    .action(async (session: Document) => {
        let isSessionFresh = false;

        const lastUpdate = session.getAttribute('mfaUpdatedAt');
        if (lastUpdate) {
            const now = moment(DateTime.now());
            const maxAllowedDate =  moment( DateTime.addSeconds(new Date(lastUpdate), Auth.MFA_RECENT_DURATION)); 
            isSessionFresh = maxAllowedDate.isAfter(now);
        }

        if (!isSessionFresh) {
            throw new AppcondaException(AppcondaException.USER_CHALLENGE_REQUIRED);
        }
    });

App.init()
    .groups(['auth'])
    .inject('appconda')
    .inject('request')
    .inject('project')
    .inject('geodb')
    .action(async (appconda: App, request: Request, project: Document, geodb: maxmind.Reader<maxmind.CityResponse>) => {
        const denylist = process.env._APP_CONSOLE_COUNTRIES_DENYLIST || '';
        if (denylist && project.getId() === 'console') {
            const countries = denylist.split(',');
            const record = await geodb.get(request.getIP()) || {};
            const country = record.country?.iso_code || '';
            if (countries.includes(country)) {
                throw new AppcondaException(AppcondaException.GENERAL_REGION_ACCESS_DENIED);
            }
        }

        const route = appconda.match(request);

        const isPrivilegedUser = Auth.isPrivilegedUser(Authorization.getRoles());
        const isAppUser = Auth.isAppUser(Authorization.getRoles());

        if (isAppUser || isPrivilegedUser) {
            return;
        }

        const auths = project.getAttribute('auths', {});
        switch (route.getLabel('auth.type', '')) {
            case 'emailPassword':
                if ((auths.emailPassword ?? true) === false) {
                    throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'Email / Password authentication is disabled for this project');
                }
                break;

            case 'magic-url':
                if ((auths.usersAuthMagicURL ?? true) === false) {
                    throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'Magic URL authentication is disabled for this project');
                }
                break;

            case 'anonymous':
                if ((auths.anonymous ?? true) === false) {
                    throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'Anonymous authentication is disabled for this project');
                }
                break;

            case 'phone':
                if ((auths.phone ?? true) === false) {
                    throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'Phone authentication is disabled for this project');
                }
                break;

            case 'invites':
                if ((auths.invites ?? true) === false) {
                    throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'Invites authentication is disabled for this project');
                }
                break;

            case 'jwt':
                if ((auths.JWT ?? true) === false) {
                    throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'JWT authentication is disabled for this project');
                }
                break;

            case 'email-otp':
                if ((auths.emailOTP ?? true) === false) {
                    throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'Email OTP authentication is disabled for this project');
                }
                break;

            default:
                throw new AppcondaException(AppcondaException.USER_AUTH_METHOD_UNSUPPORTED, 'Unsupported authentication route');
        }
    });