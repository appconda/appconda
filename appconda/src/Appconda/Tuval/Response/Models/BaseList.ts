import { Model } from '../Model';

export class BaseList extends Model {
    protected name: string = '';
    protected type: string = '';
    protected public: boolean = true;

    constructor(name: string, type: string, key: string, model: string, paging: boolean = true, isPublic: boolean = true) {
        super();
        this.name = name;
        this.type = type;
        this.public = isPublic;

        if (paging) {
            const namesWithCap = [
                'documents', 'collections', 'users', 'files', 'buckets', 'functions',
                'deployments', 'executions', 'projects', 'webhooks', 'keys',
                'platforms', 'rules', 'memberships', 'teams'
            ];

            let description: string;
            if (namesWithCap.includes(name)) {
                description = `Total number of ${key} documents that matched your query used as reference for offset pagination. When the \`total\` number of ${key} documents available is greater than 5000, total returned will be capped at 5000, and cursor pagination should be used. Read more about [pagination](https://appconda.io/docs/pagination).`;
            } else {
                description = `Total number of ${key} documents that matched your query.`;
            }

            this.addRule('total', {
                type: Model.TYPE_INTEGER,
                description: description,
                default: 0,
                example: 5,
            });
        }

        this.addRule(key, {
            type: model,
            description: `List of ${key}.`,
            default: [],
            array: true,
        });
    }

    /**
     * Get Name
     *
     * @return string
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Get Type
     *
     * @return string
     */
    public getType(): string {
        return this.type;
    }
}
