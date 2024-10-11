import { Response } from '../../Response';
import { Model } from '../Model';

export class Platform extends Model {
    protected public: boolean = false;

    constructor() {
        super();

        this
            .addRule('$id', {
                type: Model.TYPE_STRING,
                description: 'Platform ID.',
                default: '',
                example: '5e5ea5c16897e',
            })
            .addRule('$createdAt', {
                type: Model.TYPE_DATETIME,
                description: 'Platform creation date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('$updatedAt', {
                type: Model.TYPE_DATETIME,
                description: 'Platform update date in ISO 8601 format.',
                default: '',
                example: Model.TYPE_DATETIME_EXAMPLE,
            })
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Platform name.',
                default: '',
                example: 'My Web App',
            })
            .addRule('type', {
                type: Model.TYPE_STRING,
                description: 'Platform type. Possible values are: web, flutter-web, flutter-ios, flutter-android, ios, android, and unity.',
                default: '',
                example: 'web',
            })
            .addRule('key', {
                type: Model.TYPE_STRING,
                description: 'Platform Key. iOS bundle ID or Android package name. Empty string for other platforms.',
                default: '',
                example: 'com.company.appname',
            })
            .addRule('store', {
                type: Model.TYPE_STRING,
                description: 'App store or Google Play store ID.',
                example: '',
            })
            .addRule('hostname', {
                type: Model.TYPE_STRING,
                description: 'Web app hostname. Empty string for other platforms.',
                default: '',
                example: true,
            })
            .addRule('httpUser', {
                type: Model.TYPE_STRING,
                description: 'HTTP basic authentication username.',
                default: '',
                example: 'username',
            })
            .addRule('httpPass', {
                type: Model.TYPE_STRING,
                description: 'HTTP basic authentication password.',
                default: '',
                example: 'password',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Platform';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_PLATFORM;
    }
}
