const log_http_error = e => {
    console.log('\x1B[31;1m' + e.message + '\x1B[0m');

    console.log('HTTP Method: ', e.config.method.toUpperCase());
    console.log('URL: ', e.config.url);

    if (e.config.params) {
        console.log('URL Parameters: ', e.config.params);
    }

    if (e.config.method.toLowerCase() === 'post' && e.config.data) {
        console.log('Post body: ', e.config.data);
    }

    console.log('Request Headers: ', JSON.stringify(e.config.headers, null, 2));

    if (e.response) {
        console.log('Response Status: ', e.response.status);
        console.log('Response Headers: ', JSON.stringify(e.response.headers, null, 2));
        console.log('Response body: ', e.response.data);
    }

    console.log('\x1B[31;1m' + e.message + '\x1B[0m');
};

const better_error_printer = e => {
    if ( e.request ) {
        log_http_error(e);
        return;
    }

    console.error(e);
};

/**
 * This class is used to wrap an error when the error has
 * already been sent to ErrorService. This prevents higher-level
 * error handlers from sending it to ErrorService again.
 */
class ManagedError extends Error {
    constructor (source, extra = {}) {
        super(source?.message ?? source);
        this.source = source;
        this.name = `Managed(${source?.name ?? 'Error'})`;
        this.extra = extra;
    }
}

module.exports = {
    ManagedError,
    better_error_printer,

    // We export CompositeError from 'composite-error' here
    // in case we want to change the implementation later.
    // i.e. it's under the MIT license so it would be easier
    // to just copy the class to this file than maintain a fork.
    CompositeError: require('composite-error'),
};