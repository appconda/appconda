

export class Exception  {

    public static readonly USER_OAUTH2_BAD_REQUEST           = 'user_oauth2_bad_request';
    public static readonly USER_OAUTH2_UNAUTHORIZED          = 'user_oauth2_unauthorized';
    public static readonly USER_OAUTH2_PROVIDER_ERROR        = 'user_oauth2_provider_error';

    protected response: string = '';
    protected error: string = '';
    protected errorDescription: string = '';
    message: string;

    constructor(response: string = '', code: number = 0, previous: Error | null = null) {
        
        this.response = response;
        this.message = response;
        const decoded = JSON.parse(response);
        if (typeof decoded === 'object') {
            if (typeof decoded['error'] === 'object') {
                this.error = decoded['error']['status'] || 'Unknown error';
                this.errorDescription = decoded['error']['message'] || 'No description';
            } else if (Array.isArray(decoded['errors'])) {
                this.error = decoded['error'] || decoded['message'] || 'Unknown error';
                this.errorDescription = decoded['errors'][0]['message'] || 'No description';
            } else {
                this.error = decoded['error'] || decoded['message'] || 'Unknown error';
                this.errorDescription = decoded['error_description'] || 'No description';
            }

            this.message = `${this.error}: ${this.errorDescription}`;
        }

        const type = (() => {
            switch (code) {
                case 400:
                    return Exception.USER_OAUTH2_BAD_REQUEST;
                case 401:
                    return Exception.USER_OAUTH2_UNAUTHORIZED;
                default:
                    return Exception.USER_OAUTH2_PROVIDER_ERROR;
            }
        })();

       // super(type, this.message, code, previous);
    }

    /**
     * Get the error parameter from the response.
     *
     * See https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 for more information.
     */
    public getError(): string {
        return this.error;
    }

    /**
     * Get the error_description parameter from the response.
     *
     * See https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 for more information.
     */
    public getErrorDescription(): string {
        return this.errorDescription;
    }
}