import { Response } from '../../Response';
import { Model } from '../Model';

export class HealthCertificate extends Model {
    constructor() {
        super();

        this
            .addRule('name', {
                type: Model.TYPE_STRING,
                description: 'Certificate name',
                default: '',
                example: '/CN=www.google.com',
            })
            .addRule('subjectSN', {
                type: Model.TYPE_STRING,
                description: 'Subject SN',
                default: 'www.google.com',
                example: '',
            })
            .addRule('issuerOrganisation', {
                type: Model.TYPE_STRING,
                description: 'Issuer organisation',
                default: 'Google Trust Services LLC',
                example: '',
            })
            .addRule('validFrom', {
                type: Model.TYPE_STRING,
                description: 'Valid from',
                default: '',
                example: '1704200998',
            })
            .addRule('validTo', {
                type: Model.TYPE_STRING,
                description: 'Valid to',
                default: '',
                example: '1711458597',
            })
            .addRule('signatureTypeSN', {
                type: Model.TYPE_STRING,
                description: 'Signature type SN',
                default: '',
                example: 'RSA-SHA256',
            });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return 'Health Certificate';
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return Response.MODEL_HEALTH_CERTIFICATE;
    }
}
