const os = require('os');
const URL = require('url').URL;
const https = require("https");
const axios = require('axios');
const FormData = require('form-data');
const RealmoceanException = require('./exception.js');

class Client {
    static CHUNK_SIZE = 5*1024*1024; // 5MB
    
    constructor() {
        this.endpoint = 'https://HOSTNAME/v1';
        this.headers = {
            'accept-encoding': '*',
            'content-type': '',
            'user-agent' : `RealmoceanNodeJSSDK/11.1.1 (${os.type()}; ${os.version()}; ${os.arch()})`,
            'x-sdk-name': 'Node.js',
            'x-sdk-platform': 'server',
            'x-sdk-language': 'nodejs',
            'x-sdk-version': '11.1.1',
            'X-Realmocean-Response-Format' : '1.4.0',
        };
        this.selfSigned = false;
    }

    /**
     * Set Project
     *
     * Your project ID
     *
     * @param {string} project
     *
     * @return self
     */
    setProject(project) {
        this.addHeader('X-Realmocean-Realm', project);

        return this;
    }

    /**
     * Set Key
     *
     * Your secret API key
     *
     * @param {string} key
     *
     * @return self
     */
    setKey(key) {
        this.addHeader('X-Realmocean-Key', key);

        return this;
    }

    /**
     * Set JWT
     *
     * Your secret JSON Web Token
     *
     * @param {string} jwt
     *
     * @return self
     */
    setJWT(jwt) {
        this.addHeader('X-Realmocean-JWT', jwt);

        return this;
    }

    /**
     * Set Locale
     *
     * @param {string} locale
     *
     * @return self
     */
    setLocale(locale) {
        this.addHeader('X-Realmocean-Locale', locale);

        return this;
    }

    /**
     * Set self signed.
     *
     * @param {bool} status
     *
     * @return this
     */
    setSelfSigned(status = true) {
        this.selfSigned = status;

        return this;
    }

    /**
     * Set endpoint.
     *
     * @param {string} endpoint
     *
     * @return this
     */
    setEndpoint(endpoint)
    {
        this.endpoint = endpoint;

        return this;
    }

    /**
     * @param {string} key
     * @param {string} value
     */
    addHeader(key, value) {
        this.headers[key.toLowerCase()] = value;
        
        return this;
    }
      
    async call(method, path = '', headers = {}, params = {}, responseType = 'json') {
        headers = Object.assign({}, this.headers, headers);

        let contentType = headers['content-type'].toLowerCase();

        let formData = null;

        // Compute FormData for axios and appconda.
        if (contentType.startsWith('multipart/form-data')) {
            const form = new FormData();
            
            let flatParams = Client.flatten(params);
            
            for (const key in flatParams) {
                const value = flatParams[key];

                if(value && value.type && value.type === 'file') {
                    form.append(key, value.file, { filename: value.filename });
                } else {
                    form.append(key, flatParams[key]);
                }
            }

            headers = {
                ...headers,
                ...form.getHeaders()
            };

            formData = form;
        }

        let options = {
            method: method.toUpperCase(),
            url: this.endpoint + path,
            params: (method.toUpperCase() === 'GET') ? params : {},
            headers: headers,
            data: (method.toUpperCase() === 'GET' || contentType.startsWith('multipart/form-data')) ? formData : params,
            json: (contentType.startsWith('application/json')),
            responseType: responseType
        };
        if (this.selfSigned) {
            // Allow self signed requests
            options.httpsAgent = new https.Agent({ rejectUnauthorized: false });
        }
        try {
            let response = await axios(options);
            return response.data;
        } catch(error) {
            if('response' in error && error.response !== undefined) {
                if(error.response && 'data' in error.response) {
                    if (typeof(error.response.data) === 'string') {
                        throw new RealmoceanException(error.response.data, error.response.status, '', error.response.data);
                    } else {
                        throw new RealmoceanException(error.response.data.message, error.response.status, error.response.data.type, error.response.data);
                    }
                } else {
                    throw new RealmoceanException(error.response.statusText, error.response.status, error.response.data);
                }
            } else {
                throw new RealmoceanException(error.message);
            }
        }
    }

    static flatten(data, prefix = '') {
        let output = {};

        for (const key in data) {
            let value = data[key];
            let finalKey = prefix ? prefix + '[' + key +']' : key;

            if (Array.isArray(value)) {
                output = Object.assign(output, Client.flatten(value, finalKey)); // @todo: handle name collision here if needed
            } else {
                output[finalKey] = value;
            }
        }

        return output;
    }
}

module.exports = Client;
