/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
class TeePromise {
    static STATUS_PENDING = Symbol('pending');
    static STATUS_RUNNING = {};
    static STATUS_DONE = Symbol('done');
    constructor () {
        this.status_ = this.constructor.STATUS_PENDING;
        this.donePromise = new Promise((resolve, reject) => {
            this.doneResolve = resolve;
            this.doneReject = reject;
        });
    }
    get status () {
        return this.status_;
    }
    set status (status) {
        this.status_ = status;
        if ( status === this.constructor.STATUS_DONE ) {
            this.doneResolve();
        }
    }
    resolve (value) {
        this.status_ = this.constructor.STATUS_DONE;
        this.doneResolve(value);
    }
    awaitDone () {
        return this.donePromise;
    }
    then (fn, ...a) {
        return this.donePromise.then(fn, ...a);
    }

    reject (err) {
        this.status_ = this.constructor.STATUS_DONE;
        this.doneReject(err);
    }

    /**
     * @deprecated use then() instead
     */
    onComplete(fn) {
        return this.then(fn);
    }
}

class Lock {
    constructor() {
        this._locked = false;
        this._waiting = [];
    }

    async acquire(callback) {
        await new Promise(resolve => {
            if ( ! this._locked ) {
                this._locked = true;
                resolve();
            } else {
                this._waiting.push({
                    resolve,
                });
            }
        })
        if ( callback ) {
            let retval;
            try {
                retval = await callback();
            } finally {
                this.release();
            }
            return retval;
        }
    }

    release() {
        if (this._waiting.length > 0) {
            const { resolve } = this._waiting.shift();
            resolve();
        } else {
            this._locked = false;
        }
    }
}

/**
 * @callback behindScheduleCallback
 * @param {number} drift - The number of milliseconds that the callback was
 *    called behind schedule.
 * @returns {boolean} - If the callback returns true, the timer will be
 *   cancelled.
 */

/**
 * When passing an async callback to setInterval, it's possible for the
 * callback to be called again before the previous invocation has finished.
 *
 * This function wraps setInterval and ensures that the callback is not
 * called again until the previous invocation has finished.
 *
 * @param {Function} callback - The function to call when the timer elapses.
 * @param {number} delay - The minimum number of milliseconds between invocations.
 * @param {?Array<any>} args - Additional arguments to pass to setInterval.
 * @param {?Object} options - Additional options.
 * @param {behindScheduleCallback} options.onBehindSchedule - A callback to call when the callback is called behind schedule.
 */
const asyncSafeSetInterval = async (callback, delay, args, options) => {
    args = args ?? [];
    options = options ?? {};
    const { onBehindSchedule } = options;

    const sleep = (ms) => new Promise(rslv => setTimeout(rslv, ms));

    for ( ;; ) {
        await sleep(delay);

        const ts_start = Date.now();
        await callback(...args);
        const ts_end = Date.now();

        const runtime = ts_end - ts_start;
        const sleep_time = delay - runtime;

        if ( sleep_time < 0 ) {
            if ( onBehindSchedule ) {
                const cancel = await onBehindSchedule(-sleep_time);
                if ( cancel ) {
                    return;
                }
            }
        } else {
            await sleep(sleep_time);
        }
    }
}

module.exports = {
    TeePromise,
    Lock,
    asyncSafeSetInterval,
};