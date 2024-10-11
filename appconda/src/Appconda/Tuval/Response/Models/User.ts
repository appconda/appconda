
import { Document } from '../../../../Tuval/Core';
import { Response } from '../../Response';
import { Model } from '../Model';
import { APP_USER_ACCCESS } from '../../../../app/init';

export class User extends Model {
    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'User ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'User creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'User update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'User name.',
                default: '',
                example: 'John Doe',
            })
            .addRule('password', {
                type: Model.TYPE_STRING,
                description: 'Hashed user password.',
                required: false,
                default: '',
                example: '$argon2id$v=19$m=2048,t=4,p=3$aUZjLnliVWRINmFNTWMudg$5S+x+7uA31xFnrHFT47yFwcJeaP0w92L/4LdgrVRXxE',
            })
            .addRule('hash', {
                type: Model.TYPE_STRING,
                description: 'Password hashing algorithm.',
                required: false,
                default: '',
                example: 'argon2',
            })
            .addRule('hashOptions', {
                type: [
                    Response.MODEL_ALGO_ARGON2,
                    Response.MODEL_ALGO_SCRYPT,
                    Response.MODEL_ALGO_SCRYPT_MODIFIED,
                    Response.MODEL_ALGO_BCRYPT,
                    Response.MODEL_ALGO_PHPASS,
                    Response.MODEL_ALGO_SHA,
                    Response.MODEL_ALGO_MD5, // keep least secure at the bottom. this order will be used in docs
                ],
                description: 'Password hashing algorithm configuration.',
                required: false,
                default: [],
                example: {},
                array: false,
            })
            .addRule('registration', {
                type: Model.TYPE_DATETIME,
                description: 'User registration date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('status', {
                type: Model.TYPE_BOOLEAN,
                description: 'User status. Pass `true` for enabled and `false` for disabled.',
                default: true,
                example: true,
            })
            .addRule('labels', {
                type: Model.TYPE_STRING,
                description: 'Labels for the user.',
                default: [],
                example: ['vip'],
                array: true,
            })
            .addRule('passwordUpdate', {
                type: Model.TYPE_DATETIME,
                description: 'Password update time in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('email', {
                type: Model.TYPE_STRING,
                description: 'User email address.',
                default: '',
                example: 'john@appconda.io',
            })
            .addRule('phone', {
                type: Model.TYPE_STRING,
                description: 'User phone number in E.164 format.',
                default: '',
                example: '+4930901820',
            })
            .addRule('emailVerification', {
                type: Model.TYPE_BOOLEAN,
                description: 'Email verification status.',
                default: false,
                example: true,
            })
            .addRule('phoneVerification', {
                type: Model.TYPE_BOOLEAN,
                description: 'Phone verification status.',
                default: false,
                example: true,
            })
            .addRule('mfa', {
                type: Model.TYPE_BOOLEAN,
                description: 'Multi factor authentication status.',
                default: false,
                example: true,
            })
            .addRule('prefs', {
                type: Response.MODEL_PREFERENCES,
                description: 'User preferences as a key-value object',
                default: {},
                example: { theme: 'pink', timezone: 'UTC' },
            })
            .addRule('targets', {
                type: Response.MODEL_TARGET,
                description: 'A user-owned message receiver. A single user may have multiple e.g. emails, phones, and a browser. Each target is registered with a single provider.',
                default: [],
                array: true,
                example: [],
            })
            .addRule('accessedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Most recent access date in ISO 8601 format. This attribute is only updated again after ' + (APP_USER_ACCCESS / 60 / 60) + ' hours.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            });
    }

    /**
     * Filter Document Structure
     *
     * @param document Document to filter
     * @return Document
     */
    public filter(document: Document): Document {
        let prefs = document.getAttribute('prefs');
        if (prefs instanceof Document) {
            prefs = prefs.getArrayCopy();
        }

        if (Array.isArray(prefs) && prefs.length === 0) {
            document.setAttribute('prefs', {});
        }
        return document;
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'User';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_USER;
    }
}