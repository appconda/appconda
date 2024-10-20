(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("@tanstack/react-query"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "@tanstack/react-query"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("react"), require("@tanstack/react-query")) : factory(root["react"], root["@tanstack/react-query"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function(__WEBPACK_EXTERNAL_MODULE_react__, __WEBPACK_EXTERNAL_MODULE__tanstack_react_query__) {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@appconda/web-sdk/index.js":
/*!*************************************************!*\
  !*** ./node_modules/@appconda/web-sdk/index.js ***!
  \*************************************************/
/***/ ((module) => {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else { var i, a; }
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client.ts":
/*!***********************!*\
  !*** ./src/client.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_633__) => {

__nested_webpack_require_633__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_633__.d(__webpack_exports__, {
/* harmony export */   "Client": () => (/* binding */ Client),
/* harmony export */   "AppcondaException": () => (/* binding */ AppcondaException),
/* harmony export */   "Query": () => (/* reexport safe */ _query__WEBPACK_IMPORTED_MODULE_1__.Query)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_633__(/*! ./service */ "./src/service.ts");
/* harmony import */ var _query__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_633__(/*! ./query */ "./src/query.ts");

class AppcondaException extends Error {
    constructor(message, code = 0, type = '', response = '') {
        super(message);
        this.name = 'AppcondaException';
        this.message = message;
        this.code = code;
        this.type = type;
        this.response = response;
    }
}
class Client {
    constructor() {
        this.config = {
            endpoint: 'https://cloud.appconda.io/v1',
            endpointRealtime: '',
            project: '',
            jwt: '',
            locale: '',
            session: '',
        };
        this.headers = {
            'x-sdk-name': 'Web',
            'x-sdk-platform': 'client',
            'x-sdk-language': 'web',
            'x-sdk-version': '15.0.0',
            'X-Appconda-Response-Format': '1.5.0',
        };
        this.realtime = {
            socket: undefined,
            timeout: undefined,
            url: '',
            channels: new Set(),
            subscriptions: new Map(),
            subscriptionsCounter: 0,
            reconnect: true,
            reconnectAttempts: 0,
            lastMessage: undefined,
            connect: () => {
                clearTimeout(this.realtime.timeout);
                this.realtime.timeout = window?.setTimeout(() => {
                    this.realtime.createSocket();
                }, 50);
            },
            getTimeout: () => {
                switch (true) {
                    case this.realtime.reconnectAttempts < 5:
                        return 1000;
                    case this.realtime.reconnectAttempts < 15:
                        return 5000;
                    case this.realtime.reconnectAttempts < 100:
                        return 10000;
                    default:
                        return 60000;
                }
            },
            createSocket: () => {
                if (this.realtime.channels.size < 1) {
                    this.realtime.reconnect = false;
                    this.realtime.socket?.close();
                    return;
                }
                const channels = new URLSearchParams();
                channels.set('project', this.config.project);
                this.realtime.channels.forEach(channel => {
                    channels.append('channels[]', channel);
                });
                const url = this.config.endpointRealtime + '/realtime?' + channels.toString();
                if (url !== this.realtime.url || // Check if URL is present
                    !this.realtime.socket || // Check if WebSocket has not been created
                    this.realtime.socket?.readyState > WebSocket.OPEN // Check if WebSocket is CLOSING (3) or CLOSED (4)
                ) {
                    if (this.realtime.socket &&
                        this.realtime.socket?.readyState < WebSocket.CLOSING // Close WebSocket if it is CONNECTING (0) or OPEN (1)
                    ) {
                        this.realtime.reconnect = false;
                        this.realtime.socket.close();
                    }
                    this.realtime.url = url;
                    this.realtime.socket = new WebSocket(url);
                    this.realtime.socket.addEventListener('message', this.realtime.onMessage);
                    this.realtime.socket.addEventListener('open', _event => {
                        this.realtime.reconnectAttempts = 0;
                    });
                    this.realtime.socket.addEventListener('close', event => {
                        if (!this.realtime.reconnect ||
                            (this.realtime?.lastMessage?.type === 'error' && // Check if last message was of type error
                                (this.realtime?.lastMessage.data).code === 1008 // Check for policy violation 1008
                            )) {
                            this.realtime.reconnect = true;
                            return;
                        }
                        const timeout = this.realtime.getTimeout();
                        console.error(`Realtime got disconnected. Reconnect will be attempted in ${timeout / 1000} seconds.`, event.reason);
                        setTimeout(() => {
                            this.realtime.reconnectAttempts++;
                            this.realtime.createSocket();
                        }, timeout);
                    });
                }
            },
            onMessage: (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.realtime.lastMessage = message;
                    switch (message.type) {
                        case 'connected':
                            const cookie = JSON.parse(window.localStorage.getItem('cookieFallback') ?? '{}');
                            const session = cookie?.[`a_session_${this.config.project}`];
                            const messageData = message.data;
                            if (session && !messageData.user) {
                                this.realtime.socket?.send(JSON.stringify({
                                    type: 'authentication',
                                    data: {
                                        session
                                    }
                                }));
                            }
                            break;
                        case 'event':
                            let data = message.data;
                            if (data?.channels) {
                                const isSubscribed = data.channels.some(channel => this.realtime.channels.has(channel));
                                if (!isSubscribed)
                                    return;
                                this.realtime.subscriptions.forEach(subscription => {
                                    if (data.channels.some(channel => subscription.channels.includes(channel))) {
                                        setTimeout(() => subscription.callback(data));
                                    }
                                });
                            }
                            break;
                        case 'error':
                            throw message.data;
                        default:
                            break;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            },
            cleanUp: channels => {
                this.realtime.channels.forEach(channel => {
                    if (channels.includes(channel)) {
                        let found = Array.from(this.realtime.subscriptions).some(([_key, subscription]) => {
                            return subscription.channels.includes(channel);
                        });
                        if (!found) {
                            this.realtime.channels.delete(channel);
                        }
                    }
                });
            }
        };
    }
    /**
     * Set Endpoint
     *
     * Your project endpoint
     *
     * @param {string} endpoint
     *
     * @returns {this}
     */
    setEndpoint(endpoint) {
        this.config.endpoint = endpoint;
        this.config.endpointRealtime = this.config.endpointRealtime || this.config.endpoint.replace('https://', 'wss://').replace('http://', 'ws://');
        return this;
    }
    /**
     * Set Realtime Endpoint
     *
     * @param {string} endpointRealtime
     *
     * @returns {this}
     */
    setEndpointRealtime(endpointRealtime) {
        this.config.endpointRealtime = endpointRealtime;
        return this;
    }
    /**
     * Set Project
     *
     * Your project ID
     *
     * @param value string
     *
     * @return {this}
     */
    setProject(value) {
        this.headers['X-Appconda-Project'] = value;
        this.config.project = value;
        return this;
    }
    /**
     * Set JWT
     *
     * Your secret JSON Web Token
     *
     * @param value string
     *
     * @return {this}
     */
    setJWT(value) {
        this.headers['X-Appconda-JWT'] = value;
        this.config.jwt = value;
        return this;
    }
    /**
     * Set Locale
     *
     * @param value string
     *
     * @return {this}
     */
    setLocale(value) {
        this.headers['X-Appconda-Locale'] = value;
        this.config.locale = value;
        return this;
    }
    /**
     * Set Session
     *
     * The user session to authenticate with
     *
     * @param value string
     *
     * @return {this}
     */
    setSession(value) {
        this.headers['X-Appconda-Session'] = value;
        this.config.session = value;
        return this;
    }
    /**
     * Subscribes to Appconda events and passes you the payload in realtime.
     *
     * @param {string|string[]} channels
     * Channel to subscribe - pass a single channel as a string or multiple with an array of strings.
     *
     * Possible channels are:
     * - account
     * - collections
     * - collections.[ID]
     * - collections.[ID].documents
     * - documents
     * - documents.[ID]
     * - files
     * - files.[ID]
     * - executions
     * - executions.[ID]
     * - functions.[ID]
     * - teams
     * - teams.[ID]
     * - memberships
     * - memberships.[ID]
     * @param {(payload: RealtimeMessage) => void} callback Is called on every realtime update.
     * @returns {() => void} Unsubscribes from events.
     */
    subscribe(channels, callback) {
        let channelArray = typeof channels === 'string' ? [channels] : channels;
        channelArray.forEach(channel => this.realtime.channels.add(channel));
        const counter = this.realtime.subscriptionsCounter++;
        this.realtime.subscriptions.set(counter, {
            channels: channelArray,
            callback
        });
        this.realtime.connect();
        return () => {
            this.realtime.subscriptions.delete(counter);
            this.realtime.cleanUp(channelArray);
            this.realtime.connect();
        };
    }
    async call(method, url, headers = {}, params = {}) {
        method = method.toUpperCase();
        headers = Object.assign({}, this.headers, headers);
        let options = {
            method,
            headers,
            credentials: 'include'
        };
        if (typeof window !== 'undefined' && window.localStorage) {
            const cookieFallback = window.localStorage.getItem('cookieFallback');
            if (cookieFallback) {
                headers['X-Fallback-Cookies'] = cookieFallback;
            }
        }
        if (method === 'GET') {
            for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(params))) {
                url.searchParams.append(key, value);
            }
        }
        else {
            switch (headers['content-type']) {
                case 'application/json':
                    options.body = JSON.stringify(params);
                    break;
                case 'multipart/form-data':
                    let formData = new FormData();
                    for (const key in params) {
                        if (Array.isArray(params[key])) {
                            params[key].forEach((value) => {
                                formData.append(key + '[]', value);
                            });
                        }
                        else {
                            formData.append(key, params[key]);
                        }
                    }
                    options.body = formData;
                    delete headers['content-type'];
                    break;
            }
        }
        try {
            let data = null;
            const response = await fetch(url.toString(), options);
            if (response.headers.get('content-type')?.includes('application/json')) {
                data = await response.json();
            }
            else {
                data = {
                    message: await response.text()
                };
            }
            if (400 <= response.status) {
                throw new AppcondaException(data?.message, response.status, data?.type, data);
            }
            const cookieFallback = response.headers.get('X-Fallback-Cookies');
            if (typeof window !== 'undefined' && window.localStorage && cookieFallback) {
                window.console.warn('Appconda is using localStorage for session management. Increase your security by adding a custom domain as your API endpoint.');
                window.localStorage.setItem('cookieFallback', cookieFallback);
            }
            return data;
        }
        catch (e) {
            if (e instanceof AppcondaException) {
                throw e;
            }
            throw new AppcondaException(e.message);
        }
    }
}




/***/ }),

/***/ "./src/enums/authentication-factor.ts":
/*!********************************************!*\
  !*** ./src/enums/authentication-factor.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_14400__) => {

__nested_webpack_require_14400__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_14400__.d(__webpack_exports__, {
/* harmony export */   "AuthenticationFactor": () => (/* binding */ AuthenticationFactor)
/* harmony export */ });
var AuthenticationFactor;
(function (AuthenticationFactor) {
    AuthenticationFactor["Email"] = "email";
    AuthenticationFactor["Phone"] = "phone";
    AuthenticationFactor["Totp"] = "totp";
    AuthenticationFactor["Recoverycode"] = "recoverycode";
})(AuthenticationFactor || (AuthenticationFactor = {}));


/***/ }),

/***/ "./src/enums/authenticator-type.ts":
/*!*****************************************!*\
  !*** ./src/enums/authenticator-type.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_15212__) => {

__nested_webpack_require_15212__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_15212__.d(__webpack_exports__, {
/* harmony export */   "AuthenticatorType": () => (/* binding */ AuthenticatorType)
/* harmony export */ });
var AuthenticatorType;
(function (AuthenticatorType) {
    AuthenticatorType["Totp"] = "totp";
})(AuthenticatorType || (AuthenticatorType = {}));


/***/ }),

/***/ "./src/enums/browser.ts":
/*!******************************!*\
  !*** ./src/enums/browser.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_15810__) => {

__nested_webpack_require_15810__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_15810__.d(__webpack_exports__, {
/* harmony export */   "Browser": () => (/* binding */ Browser)
/* harmony export */ });
var Browser;
(function (Browser) {
    Browser["AvantBrowser"] = "aa";
    Browser["AndroidWebViewBeta"] = "an";
    Browser["GoogleChrome"] = "ch";
    Browser["GoogleChromeIOS"] = "ci";
    Browser["GoogleChromeMobile"] = "cm";
    Browser["Chromium"] = "cr";
    Browser["MozillaFirefox"] = "ff";
    Browser["Safari"] = "sf";
    Browser["MobileSafari"] = "mf";
    Browser["MicrosoftEdge"] = "ps";
    Browser["MicrosoftEdgeIOS"] = "oi";
    Browser["OperaMini"] = "om";
    Browser["Opera"] = "op";
    Browser["OperaNext"] = "on";
})(Browser || (Browser = {}));


/***/ }),

/***/ "./src/enums/credit-card.ts":
/*!**********************************!*\
  !*** ./src/enums/credit-card.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_16827__) => {

__nested_webpack_require_16827__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_16827__.d(__webpack_exports__, {
/* harmony export */   "CreditCard": () => (/* binding */ CreditCard)
/* harmony export */ });
var CreditCard;
(function (CreditCard) {
    CreditCard["AmericanExpress"] = "amex";
    CreditCard["Argencard"] = "argencard";
    CreditCard["Cabal"] = "cabal";
    CreditCard["Cencosud"] = "cencosud";
    CreditCard["DinersClub"] = "diners";
    CreditCard["Discover"] = "discover";
    CreditCard["Elo"] = "elo";
    CreditCard["Hipercard"] = "hipercard";
    CreditCard["JCB"] = "jcb";
    CreditCard["Mastercard"] = "mastercard";
    CreditCard["Naranja"] = "naranja";
    CreditCard["TarjetaShopping"] = "targeta-shopping";
    CreditCard["UnionChinaPay"] = "union-china-pay";
    CreditCard["Visa"] = "visa";
    CreditCard["MIR"] = "mir";
    CreditCard["Maestro"] = "maestro";
})(CreditCard || (CreditCard = {}));


/***/ }),

/***/ "./src/enums/execution-method.ts":
/*!***************************************!*\
  !*** ./src/enums/execution-method.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_18025__) => {

__nested_webpack_require_18025__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_18025__.d(__webpack_exports__, {
/* harmony export */   "ExecutionMethod": () => (/* binding */ ExecutionMethod)
/* harmony export */ });
var ExecutionMethod;
(function (ExecutionMethod) {
    ExecutionMethod["GET"] = "GET";
    ExecutionMethod["POST"] = "POST";
    ExecutionMethod["PUT"] = "PUT";
    ExecutionMethod["PATCH"] = "PATCH";
    ExecutionMethod["DELETE"] = "DELETE";
    ExecutionMethod["OPTIONS"] = "OPTIONS";
})(ExecutionMethod || (ExecutionMethod = {}));


/***/ }),

/***/ "./src/enums/flag.ts":
/*!***************************!*\
  !*** ./src/enums/flag.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_18795__) => {

__nested_webpack_require_18795__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_18795__.d(__webpack_exports__, {
/* harmony export */   "Flag": () => (/* binding */ Flag)
/* harmony export */ });
var Flag;
(function (Flag) {
    Flag["Afghanistan"] = "af";
    Flag["Angola"] = "ao";
    Flag["Albania"] = "al";
    Flag["Andorra"] = "ad";
    Flag["UnitedArabEmirates"] = "ae";
    Flag["Argentina"] = "ar";
    Flag["Armenia"] = "am";
    Flag["AntiguaAndBarbuda"] = "ag";
    Flag["Australia"] = "au";
    Flag["Austria"] = "at";
    Flag["Azerbaijan"] = "az";
    Flag["Burundi"] = "bi";
    Flag["Belgium"] = "be";
    Flag["Benin"] = "bj";
    Flag["BurkinaFaso"] = "bf";
    Flag["Bangladesh"] = "bd";
    Flag["Bulgaria"] = "bg";
    Flag["Bahrain"] = "bh";
    Flag["Bahamas"] = "bs";
    Flag["BosniaAndHerzegovina"] = "ba";
    Flag["Belarus"] = "by";
    Flag["Belize"] = "bz";
    Flag["Bolivia"] = "bo";
    Flag["Brazil"] = "br";
    Flag["Barbados"] = "bb";
    Flag["BruneiDarussalam"] = "bn";
    Flag["Bhutan"] = "bt";
    Flag["Botswana"] = "bw";
    Flag["CentralAfricanRepublic"] = "cf";
    Flag["Canada"] = "ca";
    Flag["Switzerland"] = "ch";
    Flag["Chile"] = "cl";
    Flag["China"] = "cn";
    Flag["CoteDIvoire"] = "ci";
    Flag["Cameroon"] = "cm";
    Flag["DemocraticRepublicOfTheCongo"] = "cd";
    Flag["RepublicOfTheCongo"] = "cg";
    Flag["Colombia"] = "co";
    Flag["Comoros"] = "km";
    Flag["CapeVerde"] = "cv";
    Flag["CostaRica"] = "cr";
    Flag["Cuba"] = "cu";
    Flag["Cyprus"] = "cy";
    Flag["CzechRepublic"] = "cz";
    Flag["Germany"] = "de";
    Flag["Djibouti"] = "dj";
    Flag["Dominica"] = "dm";
    Flag["Denmark"] = "dk";
    Flag["DominicanRepublic"] = "do";
    Flag["Algeria"] = "dz";
    Flag["Ecuador"] = "ec";
    Flag["Egypt"] = "eg";
    Flag["Eritrea"] = "er";
    Flag["Spain"] = "es";
    Flag["Estonia"] = "ee";
    Flag["Ethiopia"] = "et";
    Flag["Finland"] = "fi";
    Flag["Fiji"] = "fj";
    Flag["France"] = "fr";
    Flag["MicronesiaFederatedStatesOf"] = "fm";
    Flag["Gabon"] = "ga";
    Flag["UnitedKingdom"] = "gb";
    Flag["Georgia"] = "ge";
    Flag["Ghana"] = "gh";
    Flag["Guinea"] = "gn";
    Flag["Gambia"] = "gm";
    Flag["GuineaBissau"] = "gw";
    Flag["EquatorialGuinea"] = "gq";
    Flag["Greece"] = "gr";
    Flag["Grenada"] = "gd";
    Flag["Guatemala"] = "gt";
    Flag["Guyana"] = "gy";
    Flag["Honduras"] = "hn";
    Flag["Croatia"] = "hr";
    Flag["Haiti"] = "ht";
    Flag["Hungary"] = "hu";
    Flag["Indonesia"] = "id";
    Flag["India"] = "in";
    Flag["Ireland"] = "ie";
    Flag["IranIslamicRepublicOf"] = "ir";
    Flag["Iraq"] = "iq";
    Flag["Iceland"] = "is";
    Flag["Israel"] = "il";
    Flag["Italy"] = "it";
    Flag["Jamaica"] = "jm";
    Flag["Jordan"] = "jo";
    Flag["Japan"] = "jp";
    Flag["Kazakhstan"] = "kz";
    Flag["Kenya"] = "ke";
    Flag["Kyrgyzstan"] = "kg";
    Flag["Cambodia"] = "kh";
    Flag["Kiribati"] = "ki";
    Flag["SaintKittsAndNevis"] = "kn";
    Flag["SouthKorea"] = "kr";
    Flag["Kuwait"] = "kw";
    Flag["LaoPeopleSDemocraticRepublic"] = "la";
    Flag["Lebanon"] = "lb";
    Flag["Liberia"] = "lr";
    Flag["Libya"] = "ly";
    Flag["SaintLucia"] = "lc";
    Flag["Liechtenstein"] = "li";
    Flag["SriLanka"] = "lk";
    Flag["Lesotho"] = "ls";
    Flag["Lithuania"] = "lt";
    Flag["Luxembourg"] = "lu";
    Flag["Latvia"] = "lv";
    Flag["Morocco"] = "ma";
    Flag["Monaco"] = "mc";
    Flag["Moldova"] = "md";
    Flag["Madagascar"] = "mg";
    Flag["Maldives"] = "mv";
    Flag["Mexico"] = "mx";
    Flag["MarshallIslands"] = "mh";
    Flag["NorthMacedonia"] = "mk";
    Flag["Mali"] = "ml";
    Flag["Malta"] = "mt";
    Flag["Myanmar"] = "mm";
    Flag["Montenegro"] = "me";
    Flag["Mongolia"] = "mn";
    Flag["Mozambique"] = "mz";
    Flag["Mauritania"] = "mr";
    Flag["Mauritius"] = "mu";
    Flag["Malawi"] = "mw";
    Flag["Malaysia"] = "my";
    Flag["Namibia"] = "na";
    Flag["Niger"] = "ne";
    Flag["Nigeria"] = "ng";
    Flag["Nicaragua"] = "ni";
    Flag["Netherlands"] = "nl";
    Flag["Norway"] = "no";
    Flag["Nepal"] = "np";
    Flag["Nauru"] = "nr";
    Flag["NewZealand"] = "nz";
    Flag["Oman"] = "om";
    Flag["Pakistan"] = "pk";
    Flag["Panama"] = "pa";
    Flag["Peru"] = "pe";
    Flag["Philippines"] = "ph";
    Flag["Palau"] = "pw";
    Flag["PapuaNewGuinea"] = "pg";
    Flag["Poland"] = "pl";
    Flag["FrenchPolynesia"] = "pf";
    Flag["NorthKorea"] = "kp";
    Flag["Portugal"] = "pt";
    Flag["Paraguay"] = "py";
    Flag["Qatar"] = "qa";
    Flag["Romania"] = "ro";
    Flag["Russia"] = "ru";
    Flag["Rwanda"] = "rw";
    Flag["SaudiArabia"] = "sa";
    Flag["Sudan"] = "sd";
    Flag["Senegal"] = "sn";
    Flag["Singapore"] = "sg";
    Flag["SolomonIslands"] = "sb";
    Flag["SierraLeone"] = "sl";
    Flag["ElSalvador"] = "sv";
    Flag["SanMarino"] = "sm";
    Flag["Somalia"] = "so";
    Flag["Serbia"] = "rs";
    Flag["SouthSudan"] = "ss";
    Flag["SaoTomeAndPrincipe"] = "st";
    Flag["Suriname"] = "sr";
    Flag["Slovakia"] = "sk";
    Flag["Slovenia"] = "si";
    Flag["Sweden"] = "se";
    Flag["Eswatini"] = "sz";
    Flag["Seychelles"] = "sc";
    Flag["Syria"] = "sy";
    Flag["Chad"] = "td";
    Flag["Togo"] = "tg";
    Flag["Thailand"] = "th";
    Flag["Tajikistan"] = "tj";
    Flag["Turkmenistan"] = "tm";
    Flag["TimorLeste"] = "tl";
    Flag["Tonga"] = "to";
    Flag["TrinidadAndTobago"] = "tt";
    Flag["Tunisia"] = "tn";
    Flag["Turkey"] = "tr";
    Flag["Tuvalu"] = "tv";
    Flag["Tanzania"] = "tz";
    Flag["Uganda"] = "ug";
    Flag["Ukraine"] = "ua";
    Flag["Uruguay"] = "uy";
    Flag["UnitedStates"] = "us";
    Flag["Uzbekistan"] = "uz";
    Flag["VaticanCity"] = "va";
    Flag["SaintVincentAndTheGrenadines"] = "vc";
    Flag["Venezuela"] = "ve";
    Flag["Vietnam"] = "vn";
    Flag["Vanuatu"] = "vu";
    Flag["Samoa"] = "ws";
    Flag["Yemen"] = "ye";
    Flag["SouthAfrica"] = "za";
    Flag["Zambia"] = "zm";
    Flag["Zimbabwe"] = "zw";
})(Flag || (Flag = {}));


/***/ }),

/***/ "./src/enums/image-format.ts":
/*!***********************************!*\
  !*** ./src/enums/image-format.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_25087__) => {

__nested_webpack_require_25087__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_25087__.d(__webpack_exports__, {
/* harmony export */   "ImageFormat": () => (/* binding */ ImageFormat)
/* harmony export */ });
var ImageFormat;
(function (ImageFormat) {
    ImageFormat["Jpg"] = "jpg";
    ImageFormat["Jpeg"] = "jpeg";
    ImageFormat["Gif"] = "gif";
    ImageFormat["Png"] = "png";
    ImageFormat["Webp"] = "webp";
})(ImageFormat || (ImageFormat = {}));


/***/ }),

/***/ "./src/enums/image-gravity.ts":
/*!************************************!*\
  !*** ./src/enums/image-gravity.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_25797__) => {

__nested_webpack_require_25797__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_25797__.d(__webpack_exports__, {
/* harmony export */   "ImageGravity": () => (/* binding */ ImageGravity)
/* harmony export */ });
var ImageGravity;
(function (ImageGravity) {
    ImageGravity["Center"] = "center";
    ImageGravity["Topleft"] = "top-left";
    ImageGravity["Top"] = "top";
    ImageGravity["Topright"] = "top-right";
    ImageGravity["Left"] = "left";
    ImageGravity["Right"] = "right";
    ImageGravity["Bottomleft"] = "bottom-left";
    ImageGravity["Bottom"] = "bottom";
    ImageGravity["Bottomright"] = "bottom-right";
})(ImageGravity || (ImageGravity = {}));


/***/ }),

/***/ "./src/enums/o-auth-provider.ts":
/*!**************************************!*\
  !*** ./src/enums/o-auth-provider.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_26724__) => {

__nested_webpack_require_26724__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_26724__.d(__webpack_exports__, {
/* harmony export */   "OAuthProvider": () => (/* binding */ OAuthProvider)
/* harmony export */ });
var OAuthProvider;
(function (OAuthProvider) {
    OAuthProvider["Amazon"] = "amazon";
    OAuthProvider["Apple"] = "apple";
    OAuthProvider["Auth0"] = "auth0";
    OAuthProvider["Authentik"] = "authentik";
    OAuthProvider["Autodesk"] = "autodesk";
    OAuthProvider["Bitbucket"] = "bitbucket";
    OAuthProvider["Bitly"] = "bitly";
    OAuthProvider["Box"] = "box";
    OAuthProvider["Dailymotion"] = "dailymotion";
    OAuthProvider["Discord"] = "discord";
    OAuthProvider["Disqus"] = "disqus";
    OAuthProvider["Dropbox"] = "dropbox";
    OAuthProvider["Etsy"] = "etsy";
    OAuthProvider["Facebook"] = "facebook";
    OAuthProvider["Github"] = "github";
    OAuthProvider["Gitlab"] = "gitlab";
    OAuthProvider["Google"] = "google";
    OAuthProvider["Linkedin"] = "linkedin";
    OAuthProvider["Microsoft"] = "microsoft";
    OAuthProvider["Notion"] = "notion";
    OAuthProvider["Oidc"] = "oidc";
    OAuthProvider["Okta"] = "okta";
    OAuthProvider["Paypal"] = "paypal";
    OAuthProvider["PaypalSandbox"] = "paypalSandbox";
    OAuthProvider["Podio"] = "podio";
    OAuthProvider["Salesforce"] = "salesforce";
    OAuthProvider["Slack"] = "slack";
    OAuthProvider["Spotify"] = "spotify";
    OAuthProvider["Stripe"] = "stripe";
    OAuthProvider["Tradeshift"] = "tradeshift";
    OAuthProvider["TradeshiftBox"] = "tradeshiftBox";
    OAuthProvider["Twitch"] = "twitch";
    OAuthProvider["Wordpress"] = "wordpress";
    OAuthProvider["Yahoo"] = "yahoo";
    OAuthProvider["Yammer"] = "yammer";
    OAuthProvider["Yandex"] = "yandex";
    OAuthProvider["Zoho"] = "zoho";
    OAuthProvider["Zoom"] = "zoom";
    OAuthProvider["Mock"] = "mock";
})(OAuthProvider || (OAuthProvider = {}));


/***/ }),

/***/ "./src/id.ts":
/*!*******************!*\
  !*** ./src/id.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_28828__) => {

__nested_webpack_require_28828__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_28828__.d(__webpack_exports__, {
/* harmony export */   "ID": () => (/* binding */ ID)
/* harmony export */ });
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _ID_hexTimestamp;
class ID {
    static custom(id) {
        return id;
    }
    static unique(padding = 7) {
        // Generate a unique ID with padding to have a longer ID
        const baseId = __classPrivateFieldGet(_a, _a, "m", _ID_hexTimestamp).call(_a);
        let randomPadding = '';
        for (let i = 0; i < padding; i++) {
            const randomHexDigit = Math.floor(Math.random() * 16).toString(16);
            randomPadding += randomHexDigit;
        }
        return baseId + randomPadding;
    }
}
_a = ID, _ID_hexTimestamp = function _ID_hexTimestamp() {
    const now = new Date();
    const sec = Math.floor(now.getTime() / 1000);
    const msec = now.getMilliseconds();
    // Convert to hexadecimal
    const hexTimestamp = sec.toString(16) + msec.toString(16).padStart(5, '0');
    return hexTimestamp;
};


/***/ }),

/***/ "./src/permission.ts":
/*!***************************!*\
  !*** ./src/permission.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_30583__) => {

__nested_webpack_require_30583__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_30583__.d(__webpack_exports__, {
/* harmony export */   "Permission": () => (/* binding */ Permission)
/* harmony export */ });
class Permission {
}
Permission.read = (role) => {
    return `read("${role}")`;
};
Permission.write = (role) => {
    return `write("${role}")`;
};
Permission.create = (role) => {
    return `create("${role}")`;
};
Permission.update = (role) => {
    return `update("${role}")`;
};
Permission.delete = (role) => {
    return `delete("${role}")`;
};


/***/ }),

/***/ "./src/query.ts":
/*!**********************!*\
  !*** ./src/query.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_31339__) => {

__nested_webpack_require_31339__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_31339__.d(__webpack_exports__, {
/* harmony export */   "Query": () => (/* binding */ Query)
/* harmony export */ });
class Query {
    constructor(method, attribute, values) {
        this.method = method;
        this.attribute = attribute;
        if (values !== undefined) {
            if (Array.isArray(values)) {
                this.values = values;
            }
            else {
                this.values = [values];
            }
        }
    }
    toString() {
        return JSON.stringify({
            method: this.method,
            attribute: this.attribute,
            values: this.values,
        });
    }
}
Query.equal = (attribute, value) => new Query("equal", attribute, value).toString();
Query.notEqual = (attribute, value) => new Query("notEqual", attribute, value).toString();
Query.lessThan = (attribute, value) => new Query("lessThan", attribute, value).toString();
Query.lessThanEqual = (attribute, value) => new Query("lessThanEqual", attribute, value).toString();
Query.greaterThan = (attribute, value) => new Query("greaterThan", attribute, value).toString();
Query.greaterThanEqual = (attribute, value) => new Query("greaterThanEqual", attribute, value).toString();
Query.isNull = (attribute) => new Query("isNull", attribute).toString();
Query.isNotNull = (attribute) => new Query("isNotNull", attribute).toString();
Query.between = (attribute, start, end) => new Query("between", attribute, [start, end]).toString();
Query.startsWith = (attribute, value) => new Query("startsWith", attribute, value).toString();
Query.endsWith = (attribute, value) => new Query("endsWith", attribute, value).toString();
Query.select = (attributes) => new Query("select", undefined, attributes).toString();
Query.search = (attribute, value) => new Query("search", attribute, value).toString();
Query.orderDesc = (attribute) => new Query("orderDesc", attribute).toString();
Query.orderAsc = (attribute) => new Query("orderAsc", attribute).toString();
Query.cursorAfter = (documentId) => new Query("cursorAfter", undefined, documentId).toString();
Query.cursorBefore = (documentId) => new Query("cursorBefore", undefined, documentId).toString();
Query.limit = (limit) => new Query("limit", undefined, limit).toString();
Query.offset = (offset) => new Query("offset", undefined, offset).toString();
Query.contains = (attribute, value) => new Query("contains", attribute, value).toString();
Query.or = (queries) => new Query("or", undefined, queries.map((query) => JSON.parse(query))).toString();
Query.and = (queries) => new Query("and", undefined, queries.map((query) => JSON.parse(query))).toString();


/***/ }),

/***/ "./src/role.ts":
/*!*********************!*\
  !*** ./src/role.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_34239__) => {

__nested_webpack_require_34239__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_34239__.d(__webpack_exports__, {
/* harmony export */   "Role": () => (/* binding */ Role)
/* harmony export */ });
/**
 * Helper class to generate role strings for `Permission`.
 */
class Role {
    /**
     * Grants access to anyone.
     *
     * This includes authenticated and unauthenticated users.
     *
     * @returns {string}
     */
    static any() {
        return 'any';
    }
    /**
     * Grants access to a specific user by user ID.
     *
     * You can optionally pass verified or unverified for
     * `status` to target specific types of users.
     *
     * @param {string} id
     * @param {string} status
     * @returns {string}
     */
    static user(id, status = '') {
        if (status === '') {
            return `user:${id}`;
        }
        return `user:${id}/${status}`;
    }
    /**
     * Grants access to any authenticated or anonymous user.
     *
     * You can optionally pass verified or unverified for
     * `status` to target specific types of users.
     *
     * @param {string} status
     * @returns {string}
     */
    static users(status = '') {
        if (status === '') {
            return 'users';
        }
        return `users/${status}`;
    }
    /**
     * Grants access to any guest user without a session.
     *
     * Authenticated users don't have access to this role.
     *
     * @returns {string}
     */
    static guests() {
        return 'guests';
    }
    /**
     * Grants access to a team by team ID.
     *
     * You can optionally pass a role for `role` to target
     * team members with the specified role.
     *
     * @param {string} id
     * @param {string} role
     * @returns {string}
     */
    static team(id, role = '') {
        if (role === '') {
            return `team:${id}`;
        }
        return `team:${id}/${role}`;
    }
    /**
     * Grants access to a specific member of a team.
     *
     * When the member is removed from the team, they will
     * no longer have access.
     *
     * @param {string} id
     * @returns {string}
     */
    static member(id) {
        return `member:${id}`;
    }
    /**
     * Grants access to a user with the specified label.
     *
     * @param {string} name
     * @returns  {string}
     */
    static label(name) {
        return `label:${name}`;
    }
}


/***/ }),

/***/ "./src/service.ts":
/*!************************!*\
  !*** ./src/service.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_36845__) => {

__nested_webpack_require_36845__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_36845__.d(__webpack_exports__, {
/* harmony export */   "Service": () => (/* binding */ Service)
/* harmony export */ });
class Service {
    constructor(client) {
        this.client = client;
    }
    static flatten(data, prefix = '') {
        let output = {};
        for (const [key, value] of Object.entries(data)) {
            let finalKey = prefix ? prefix + '[' + key + ']' : key;
            if (Array.isArray(value)) {
                output = { ...output, ...Service.flatten(value, finalKey) };
            }
            else {
                output[finalKey] = value;
            }
        }
        return output;
    }
}
Service.CHUNK_SIZE = 5 * 1024 * 1024; // 5MB


/***/ }),

/***/ "./src/services/account.ts":
/*!*********************************!*\
  !*** ./src/services/account.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_37851__) => {

__nested_webpack_require_37851__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_37851__.d(__webpack_exports__, {
/* harmony export */   "Account": () => (/* binding */ Account)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_37851__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_37851__(/*! ../client */ "./src/client.ts");


class Account extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * Get account
     *
     * Get the currently logged in user.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async get() {
        const apiPath = '/account';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create account
     *
     * Use this endpoint to allow a new user to register a new account in your
     * project. After the user registration completes successfully, you can use
     * the
     * [/account/verfication](https://appconda.io/docs/references/cloud/client-web/account#createVerification)
     * route to start verifying the user email address. To allow the new user to
     * login to their new account, you need to create a new [account
     * session](https://appconda.io/docs/references/cloud/client-web/account#createEmailSession).
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async create(userId, email, password, name) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof email === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "email"');
        }
        if (typeof password === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "password"');
        }
        const apiPath = '/account';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof email !== 'undefined') {
            payload['email'] = email;
        }
        if (typeof password !== 'undefined') {
            payload['password'] = password;
        }
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update email
     *
     * Update currently logged in user account email address. After changing user
     * address, the user confirmation status will get reset. A new confirmation
     * email is not sent automatically however you can use the send confirmation
     * email endpoint again to send the confirmation email. For security measures,
     * user password is required to complete this request.
     * This endpoint can also be used to convert an anonymous account to a normal
     * one, by passing an email address and a new password.
     *
     *
     * @param {string} email
     * @param {string} password
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateEmail(email, password) {
        if (typeof email === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "email"');
        }
        if (typeof password === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "password"');
        }
        const apiPath = '/account/email';
        const payload = {};
        if (typeof email !== 'undefined') {
            payload['email'] = email;
        }
        if (typeof password !== 'undefined') {
            payload['password'] = password;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List Identities
     *
     * Get the list of identities for the currently logged in user.
     *
     * @param {string[]} queries
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listIdentities(queries) {
        const apiPath = '/account/identities';
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete identity
     *
     * Delete an identity by its unique ID.
     *
     * @param {string} identityId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteIdentity(identityId) {
        if (typeof identityId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "identityId"');
        }
        const apiPath = '/account/identities/{identityId}'.replace('{identityId}', identityId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create JWT
     *
     * Use this endpoint to create a JSON Web Token. You can use the resulting JWT
     * to authenticate on behalf of the current user when working with the
     * Appconda server-side API and SDKs. The JWT secret is valid for 15 minutes
     * from its creation and will be invalid if the user will logout in that time
     * frame.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createJWT() {
        const apiPath = '/account/jwt';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List logs
     *
     * Get the list of latest security activity logs for the currently logged in
     * user. Each log returns user IP address, location and date and time of log.
     *
     * @param {string[]} queries
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listLogs(queries) {
        const apiPath = '/account/logs';
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update MFA
     *
     * Enable or disable MFA on an account.
     *
     * @param {boolean} mfa
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateMFA(mfa) {
        if (typeof mfa === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "mfa"');
        }
        const apiPath = '/account/mfa';
        const payload = {};
        if (typeof mfa !== 'undefined') {
            payload['mfa'] = mfa;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Add Authenticator
     *
     * Add an authenticator app to be used as an MFA factor. Verify the
     * authenticator using the [verify
     * authenticator](/docs/references/cloud/client-web/account#updateMfaAuthenticator)
     * method.
     *
     * @param {AuthenticatorType} type
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createMfaAuthenticator(type) {
        if (typeof type === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "type"');
        }
        const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', type);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Verify Authenticator
     *
     * Verify an authenticator app after adding it using the [add
     * authenticator](/docs/references/cloud/client-web/account#createMfaAuthenticator)
     * method. add
     *
     * @param {AuthenticatorType} type
     * @param {string} otp
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateMfaAuthenticator(type, otp) {
        if (typeof type === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "type"');
        }
        if (typeof otp === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "otp"');
        }
        const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', type);
        const payload = {};
        if (typeof otp !== 'undefined') {
            payload['otp'] = otp;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete Authenticator
     *
     * Delete an authenticator for a user by ID.
     *
     * @param {AuthenticatorType} type
     * @param {string} otp
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteMfaAuthenticator(type, otp) {
        if (typeof type === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "type"');
        }
        if (typeof otp === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "otp"');
        }
        const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', type);
        const payload = {};
        if (typeof otp !== 'undefined') {
            payload['otp'] = otp;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create 2FA Challenge
     *
     * Begin the process of MFA verification after sign-in. Finish the flow with
     * [updateMfaChallenge](/docs/references/cloud/client-web/account#updateMfaChallenge)
     * method.
     *
     * @param {AuthenticationFactor} factor
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createMfaChallenge(factor) {
        if (typeof factor === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "factor"');
        }
        const apiPath = '/account/mfa/challenge';
        const payload = {};
        if (typeof factor !== 'undefined') {
            payload['factor'] = factor;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create MFA Challenge (confirmation)
     *
     * Complete the MFA challenge by providing the one-time password. Finish the
     * process of MFA verification by providing the one-time password. To begin
     * the flow, use
     * [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge)
     * method.
     *
     * @param {string} challengeId
     * @param {string} otp
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateMfaChallenge(challengeId, otp) {
        if (typeof challengeId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "challengeId"');
        }
        if (typeof otp === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "otp"');
        }
        const apiPath = '/account/mfa/challenge';
        const payload = {};
        if (typeof challengeId !== 'undefined') {
            payload['challengeId'] = challengeId;
        }
        if (typeof otp !== 'undefined') {
            payload['otp'] = otp;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List Factors
     *
     * List the factors available on the account to be used as a MFA challange.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listMfaFactors() {
        const apiPath = '/account/mfa/factors';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get MFA Recovery Codes
     *
     * Get recovery codes that can be used as backup for MFA flow. Before getting
     * codes, they must be generated using
     * [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes)
     * method. An OTP challenge is required to read recovery codes.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getMfaRecoveryCodes() {
        const apiPath = '/account/mfa/recovery-codes';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create MFA Recovery Codes
     *
     * Generate recovery codes as backup for MFA flow. It's recommended to
     * generate and show then immediately after user successfully adds their
     * authehticator. Recovery codes can be used as a MFA verification type in
     * [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge)
     * method.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createMfaRecoveryCodes() {
        const apiPath = '/account/mfa/recovery-codes';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Regenerate MFA Recovery Codes
     *
     * Regenerate recovery codes that can be used as backup for MFA flow. Before
     * regenerating codes, they must be first generated using
     * [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes)
     * method. An OTP challenge is required to regenreate recovery codes.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateMfaRecoveryCodes() {
        const apiPath = '/account/mfa/recovery-codes';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update name
     *
     * Update currently logged in user account name.
     *
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateName(name) {
        if (typeof name === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "name"');
        }
        const apiPath = '/account/name';
        const payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update password
     *
     * Update currently logged in user password. For validation, user is required
     * to pass in the new password, and the old password. For users created with
     * OAuth, Team Invites and Magic URL, oldPassword is optional.
     *
     * @param {string} password
     * @param {string} oldPassword
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updatePassword(password, oldPassword) {
        if (typeof password === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "password"');
        }
        const apiPath = '/account/password';
        const payload = {};
        if (typeof password !== 'undefined') {
            payload['password'] = password;
        }
        if (typeof oldPassword !== 'undefined') {
            payload['oldPassword'] = oldPassword;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update phone
     *
     * Update the currently logged in user's phone number. After updating the
     * phone number, the phone verification status will be reset. A confirmation
     * SMS is not sent automatically, however you can use the [POST
     * /account/verification/phone](https://appconda.io/docs/references/cloud/client-web/account#createPhoneVerification)
     * endpoint to send a confirmation SMS.
     *
     * @param {string} phone
     * @param {string} password
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updatePhone(phone, password) {
        if (typeof phone === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "phone"');
        }
        if (typeof password === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "password"');
        }
        const apiPath = '/account/phone';
        const payload = {};
        if (typeof phone !== 'undefined') {
            payload['phone'] = phone;
        }
        if (typeof password !== 'undefined') {
            payload['password'] = password;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get account preferences
     *
     * Get the preferences as a key-value object for the currently logged in user.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getPrefs() {
        const apiPath = '/account/prefs';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update preferences
     *
     * Update currently logged in user account preferences. The object you pass is
     * stored as is, and replaces any previous value. The maximum allowed prefs
     * size is 64kB and throws error if exceeded.
     *
     * @param {Partial<Preferences>} prefs
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updatePrefs(prefs) {
        if (typeof prefs === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "prefs"');
        }
        const apiPath = '/account/prefs';
        const payload = {};
        if (typeof prefs !== 'undefined') {
            payload['prefs'] = prefs;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create password recovery
     *
     * Sends the user an email with a temporary secret key for password reset.
     * When the user clicks the confirmation link he is redirected back to your
     * app password reset URL with the secret key and email address values
     * attached to the URL query string. Use the query string params to submit a
     * request to the [PUT
     * /account/recovery](https://appconda.io/docs/references/cloud/client-web/account#updateRecovery)
     * endpoint to complete the process. The verification link sent to the user's
     * email address is valid for 1 hour.
     *
     * @param {string} email
     * @param {string} url
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createRecovery(email, url) {
        if (typeof email === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "email"');
        }
        if (typeof url === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "url"');
        }
        const apiPath = '/account/recovery';
        const payload = {};
        if (typeof email !== 'undefined') {
            payload['email'] = email;
        }
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create password recovery (confirmation)
     *
     * Use this endpoint to complete the user account password reset. Both the
     * **userId** and **secret** arguments will be passed as query parameters to
     * the redirect URL you have provided when sending your request to the [POST
     * /account/recovery](https://appconda.io/docs/references/cloud/client-web/account#createRecovery)
     * endpoint.
     *
     * Please note that in order to avoid a [Redirect
     * Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md)
     * the only valid redirect URLs are the ones from domains you have set when
     * adding your platforms in the console interface.
     *
     * @param {string} userId
     * @param {string} secret
     * @param {string} password
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateRecovery(userId, secret, password) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof secret === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "secret"');
        }
        if (typeof password === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "password"');
        }
        const apiPath = '/account/recovery';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof secret !== 'undefined') {
            payload['secret'] = secret;
        }
        if (typeof password !== 'undefined') {
            payload['password'] = password;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List sessions
     *
     * Get the list of active sessions across different devices for the currently
     * logged in user.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listSessions() {
        const apiPath = '/account/sessions';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete sessions
     *
     * Delete all sessions from the user account and remove any sessions cookies
     * from the end client.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteSessions() {
        const apiPath = '/account/sessions';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create anonymous session
     *
     * Use this endpoint to allow a new user to register an anonymous account in
     * your project. This route will also create a new session for the user. To
     * allow the new user to convert an anonymous account to a normal account, you
     * need to update its [email and
     * password](https://appconda.io/docs/references/cloud/client-web/account#updateEmail)
     * or create an [OAuth2
     * session](https://appconda.io/docs/references/cloud/client-web/account#CreateOAuth2Session).
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createAnonymousSession() {
        const apiPath = '/account/sessions/anonymous';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create email password session
     *
     * Allow the user to login into their account by providing a valid email and
     * password combination. This route will create a new session for the user.
     *
     * A user is limited to 10 active sessions at a time by default. [Learn more
     * about session
     * limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {string} email
     * @param {string} password
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createEmailPasswordSession(email, password) {
        if (typeof email === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "email"');
        }
        if (typeof password === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "password"');
        }
        const apiPath = '/account/sessions/email';
        const payload = {};
        if (typeof email !== 'undefined') {
            payload['email'] = email;
        }
        if (typeof password !== 'undefined') {
            payload['password'] = password;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update magic URL session
     *
     * Use this endpoint to create a session from token. Provide the **userId**
     * and **secret** parameters from the successful response of authentication
     * flows initiated by token creation. For example, magic URL and phone login.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateMagicURLSession(userId, secret) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof secret === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "secret"');
        }
        const apiPath = '/account/sessions/magic-url';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof secret !== 'undefined') {
            payload['secret'] = secret;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create OAuth2 session
     *
     * Allow the user to login to their account using the OAuth2 provider of their
     * choice. Each OAuth2 provider should be enabled from the Appconda console
     * first. Use the success and failure arguments to provide a redirect URL's
     * back to your app when login is completed.
     *
     * If there is already an active session, the new session will be attached to
     * the logged-in account. If there are no active sessions, the server will
     * attempt to look for a user with the same email address as the email
     * received from the OAuth2 provider and attach the new session to the
     * existing user. If no matching user is found - the server will create a new
     * user.
     *
     * A user is limited to 10 active sessions at a time by default. [Learn more
     * about session
     * limits](https://appconda.io/docs/authentication-security#limits).
     *
     *
     * @param {OAuthProvider} provider
     * @param {string} success
     * @param {string} failure
     * @param {string[]} scopes
     * @throws {AppcondaException}
     * @returns {void|string}
    */
    createOAuth2Session(provider, success, failure, scopes) {
        if (typeof provider === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "provider"');
        }
        const apiPath = '/account/sessions/oauth2/{provider}'.replace('{provider}', provider);
        const payload = {};
        if (typeof success !== 'undefined') {
            payload['success'] = success;
        }
        if (typeof failure !== 'undefined') {
            payload['failure'] = failure;
        }
        if (typeof scopes !== 'undefined') {
            payload['scopes'] = scopes;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        if (typeof window !== 'undefined' && window?.location) {
            window.location.href = uri.toString();
        }
        else {
            return uri;
        }
    }
    /**
     * Update phone session
     *
     * Use this endpoint to create a session from token. Provide the **userId**
     * and **secret** parameters from the successful response of authentication
     * flows initiated by token creation. For example, magic URL and phone login.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updatePhoneSession(userId, secret) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof secret === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "secret"');
        }
        const apiPath = '/account/sessions/phone';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof secret !== 'undefined') {
            payload['secret'] = secret;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create session
     *
     * Use this endpoint to create a session from token. Provide the **userId**
     * and **secret** parameters from the successful response of authentication
     * flows initiated by token creation. For example, magic URL and phone login.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createSession(userId, secret) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof secret === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "secret"');
        }
        const apiPath = '/account/sessions/token';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof secret !== 'undefined') {
            payload['secret'] = secret;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get session
     *
     * Use this endpoint to get a logged in user's session using a Session ID.
     * Inputting 'current' will return the current session being used.
     *
     * @param {string} sessionId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getSession(sessionId) {
        if (typeof sessionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "sessionId"');
        }
        const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update session
     *
     * Use this endpoint to extend a session's length. Extending a session is
     * useful when session expiry is short. If the session was created using an
     * OAuth provider, this endpoint refreshes the access token from the provider.
     *
     * @param {string} sessionId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateSession(sessionId) {
        if (typeof sessionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "sessionId"');
        }
        const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete session
     *
     * Logout the user. Use 'current' as the session ID to logout on this device,
     * use a session ID to logout on another device. If you're looking to logout
     * the user on all devices, use [Delete
     * Sessions](https://appconda.io/docs/references/cloud/client-web/account#deleteSessions)
     * instead.
     *
     * @param {string} sessionId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteSession(sessionId) {
        if (typeof sessionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "sessionId"');
        }
        const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', sessionId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update status
     *
     * Block the currently logged in user account. Behind the scene, the user
     * record is not deleted but permanently blocked from any access. To
     * completely delete a user, use the Users API instead.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateStatus() {
        const apiPath = '/account/status';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create push target
     *
     *
     * @param {string} targetId
     * @param {string} identifier
     * @param {string} providerId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createPushTarget(targetId, identifier, providerId) {
        if (typeof targetId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "targetId"');
        }
        if (typeof identifier === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "identifier"');
        }
        const apiPath = '/account/targets/push';
        const payload = {};
        if (typeof targetId !== 'undefined') {
            payload['targetId'] = targetId;
        }
        if (typeof identifier !== 'undefined') {
            payload['identifier'] = identifier;
        }
        if (typeof providerId !== 'undefined') {
            payload['providerId'] = providerId;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update push target
     *
     *
     * @param {string} targetId
     * @param {string} identifier
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updatePushTarget(targetId, identifier) {
        if (typeof targetId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "targetId"');
        }
        if (typeof identifier === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "identifier"');
        }
        const apiPath = '/account/targets/{targetId}/push'.replace('{targetId}', targetId);
        const payload = {};
        if (typeof identifier !== 'undefined') {
            payload['identifier'] = identifier;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete push target
     *
     *
     * @param {string} targetId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deletePushTarget(targetId) {
        if (typeof targetId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "targetId"');
        }
        const apiPath = '/account/targets/{targetId}/push'.replace('{targetId}', targetId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create email token (OTP)
     *
     * Sends the user an email with a secret key for creating a session. If the
     * provided user ID has not be registered, a new user will be created. Use the
     * returned user ID and secret and submit a request to the [POST
     * /v1/account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession)
     * endpoint to complete the login process. The secret sent to the user's email
     * is valid for 15 minutes.
     *
     * A user is limited to 10 active sessions at a time by default. [Learn more
     * about session
     * limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {string} userId
     * @param {string} email
     * @param {boolean} phrase
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createEmailToken(userId, email, phrase) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof email === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "email"');
        }
        const apiPath = '/account/tokens/email';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof email !== 'undefined') {
            payload['email'] = email;
        }
        if (typeof phrase !== 'undefined') {
            payload['phrase'] = phrase;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create magic URL token
     *
     * Sends the user an email with a secret key for creating a session. If the
     * provided user ID has not been registered, a new user will be created. When
     * the user clicks the link in the email, the user is redirected back to the
     * URL you provided with the secret key and userId values attached to the URL
     * query string. Use the query string parameters to submit a request to the
     * [POST
     * /v1/account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession)
     * endpoint to complete the login process. The link sent to the user's email
     * address is valid for 1 hour. If you are on a mobile device you can leave
     * the URL parameter empty, so that the login completion will be handled by
     * your Appconda instance by default.
     *
     * A user is limited to 10 active sessions at a time by default. [Learn more
     * about session
     * limits](https://appconda.io/docs/authentication-security#limits).
     *
     *
     * @param {string} userId
     * @param {string} email
     * @param {string} url
     * @param {boolean} phrase
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createMagicURLToken(userId, email, url, phrase) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof email === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "email"');
        }
        const apiPath = '/account/tokens/magic-url';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof email !== 'undefined') {
            payload['email'] = email;
        }
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        if (typeof phrase !== 'undefined') {
            payload['phrase'] = phrase;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create OAuth2 token
     *
     * Allow the user to login to their account using the OAuth2 provider of their
     * choice. Each OAuth2 provider should be enabled from the Appconda console
     * first. Use the success and failure arguments to provide a redirect URL's
     * back to your app when login is completed.
     *
     * If authentication succeeds, `userId` and `secret` of a token will be
     * appended to the success URL as query parameters. These can be used to
     * create a new session using the [Create
     * session](https://appconda.io/docs/references/cloud/client-web/account#createSession)
     * endpoint.
     *
     * A user is limited to 10 active sessions at a time by default. [Learn more
     * about session
     * limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {OAuthProvider} provider
     * @param {string} success
     * @param {string} failure
     * @param {string[]} scopes
     * @throws {AppcondaException}
     * @returns {void|string}
    */
    createOAuth2Token(provider, success, failure, scopes) {
        if (typeof provider === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "provider"');
        }
        const apiPath = '/account/tokens/oauth2/{provider}'.replace('{provider}', provider);
        const payload = {};
        if (typeof success !== 'undefined') {
            payload['success'] = success;
        }
        if (typeof failure !== 'undefined') {
            payload['failure'] = failure;
        }
        if (typeof scopes !== 'undefined') {
            payload['scopes'] = scopes;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        if (typeof window !== 'undefined' && window?.location) {
            window.location.href = uri.toString();
        }
        else {
            return uri;
        }
    }
    /**
     * Create phone token
     *
     * Sends the user an SMS with a secret key for creating a session. If the
     * provided user ID has not be registered, a new user will be created. Use the
     * returned user ID and secret and submit a request to the [POST
     * /v1/account/sessions/token](https://appconda.io/docs/references/cloud/client-web/account#createSession)
     * endpoint to complete the login process. The secret sent to the user's phone
     * is valid for 15 minutes.
     *
     * A user is limited to 10 active sessions at a time by default. [Learn more
     * about session
     * limits](https://appconda.io/docs/authentication-security#limits).
     *
     * @param {string} userId
     * @param {string} phone
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createPhoneToken(userId, phone) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof phone === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "phone"');
        }
        const apiPath = '/account/tokens/phone';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof phone !== 'undefined') {
            payload['phone'] = phone;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create email verification
     *
     * Use this endpoint to send a verification message to your user email address
     * to confirm they are the valid owners of that address. Both the **userId**
     * and **secret** arguments will be passed as query parameters to the URL you
     * have provided to be attached to the verification email. The provided URL
     * should redirect the user back to your app and allow you to complete the
     * verification process by verifying both the **userId** and **secret**
     * parameters. Learn more about how to [complete the verification
     * process](https://appconda.io/docs/references/cloud/client-web/account#updateVerification).
     * The verification link sent to the user's email address is valid for 7 days.
     *
     * Please note that in order to avoid a [Redirect
     * Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md),
     * the only valid redirect URLs are the ones from domains you have set when
     * adding your platforms in the console interface.
     *
     *
     * @param {string} url
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createVerification(url) {
        if (typeof url === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "url"');
        }
        const apiPath = '/account/verification';
        const payload = {};
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create email verification (confirmation)
     *
     * Use this endpoint to complete the user email verification process. Use both
     * the **userId** and **secret** parameters that were attached to your app URL
     * to verify the user email ownership. If confirmed this route will return a
     * 200 status code.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateVerification(userId, secret) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof secret === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "secret"');
        }
        const apiPath = '/account/verification';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof secret !== 'undefined') {
            payload['secret'] = secret;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create phone verification
     *
     * Use this endpoint to send a verification SMS to the currently logged in
     * user. This endpoint is meant for use after updating a user's phone number
     * using the
     * [accountUpdatePhone](https://appconda.io/docs/references/cloud/client-web/account#updatePhone)
     * endpoint. Learn more about how to [complete the verification
     * process](https://appconda.io/docs/references/cloud/client-web/account#updatePhoneVerification).
     * The verification code sent to the user's phone number is valid for 15
     * minutes.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createPhoneVerification() {
        const apiPath = '/account/verification/phone';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create phone verification (confirmation)
     *
     * Use this endpoint to complete the user phone verification process. Use the
     * **userId** and **secret** that were sent to your user's phone number to
     * verify the user email ownership. If confirmed this route will return a 200
     * status code.
     *
     * @param {string} userId
     * @param {string} secret
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updatePhoneVerification(userId, secret) {
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof secret === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "secret"');
        }
        const apiPath = '/account/verification/phone';
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof secret !== 'undefined') {
            payload['secret'] = secret;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
}
;


/***/ }),

/***/ "./src/services/avatars.ts":
/*!*********************************!*\
  !*** ./src/services/avatars.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_91604__) => {

__nested_webpack_require_91604__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_91604__.d(__webpack_exports__, {
/* harmony export */   "Avatars": () => (/* binding */ Avatars)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_91604__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_91604__(/*! ../client */ "./src/client.ts");


class Avatars extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * Get browser icon
     *
     * You can use this endpoint to show different browser icons to your users.
     * The code argument receives the browser code as it appears in your user [GET
     * /account/sessions](https://appconda.io/docs/references/cloud/client-web/account#getSessions)
     * endpoint. Use width, height and quality arguments to change the output
     * settings.
     *
     * When one dimension is specified and the other is 0, the image is scaled
     * with preserved aspect ratio. If both dimensions are 0, the API provides an
     * image at source quality. If dimensions are not specified, the default size
     * of image returned is 100x100px.
     *
     * @param {Browser} code
     * @param {number} width
     * @param {number} height
     * @param {number} quality
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getBrowser(code, width, height, quality) {
        if (typeof code === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "code"');
        }
        const apiPath = '/avatars/browsers/{code}'.replace('{code}', code);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get credit card icon
     *
     * The credit card endpoint will return you the icon of the credit card
     * provider you need. Use width, height and quality arguments to change the
     * output settings.
     *
     * When one dimension is specified and the other is 0, the image is scaled
     * with preserved aspect ratio. If both dimensions are 0, the API provides an
     * image at source quality. If dimensions are not specified, the default size
     * of image returned is 100x100px.
     *
     *
     * @param {CreditCard} code
     * @param {number} width
     * @param {number} height
     * @param {number} quality
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getCreditCard(code, width, height, quality) {
        if (typeof code === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "code"');
        }
        const apiPath = '/avatars/credit-cards/{code}'.replace('{code}', code);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get favicon
     *
     * Use this endpoint to fetch the favorite icon (AKA favicon) of any remote
     * website URL.
     *
     *
     * @param {string} url
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getFavicon(url) {
        if (typeof url === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "url"');
        }
        const apiPath = '/avatars/favicon';
        const payload = {};
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get country flag
     *
     * You can use this endpoint to show different country flags icons to your
     * users. The code argument receives the 2 letter country code. Use width,
     * height and quality arguments to change the output settings. Country codes
     * follow the [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1) standard.
     *
     * When one dimension is specified and the other is 0, the image is scaled
     * with preserved aspect ratio. If both dimensions are 0, the API provides an
     * image at source quality. If dimensions are not specified, the default size
     * of image returned is 100x100px.
     *
     *
     * @param {Flag} code
     * @param {number} width
     * @param {number} height
     * @param {number} quality
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getFlag(code, width, height, quality) {
        if (typeof code === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "code"');
        }
        const apiPath = '/avatars/flags/{code}'.replace('{code}', code);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get image from URL
     *
     * Use this endpoint to fetch a remote image URL and crop it to any image size
     * you want. This endpoint is very useful if you need to crop and display
     * remote images in your app or in case you want to make sure a 3rd party
     * image is properly served using a TLS protocol.
     *
     * When one dimension is specified and the other is 0, the image is scaled
     * with preserved aspect ratio. If both dimensions are 0, the API provides an
     * image at source quality. If dimensions are not specified, the default size
     * of image returned is 400x400px.
     *
     *
     * @param {string} url
     * @param {number} width
     * @param {number} height
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getImage(url, width, height) {
        if (typeof url === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "url"');
        }
        const apiPath = '/avatars/image';
        const payload = {};
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get user initials
     *
     * Use this endpoint to show your user initials avatar icon on your website or
     * app. By default, this route will try to print your logged-in user name or
     * email initials. You can also overwrite the user name if you pass the 'name'
     * parameter. If no name is given and no user is logged, an empty avatar will
     * be returned.
     *
     * You can use the color and background params to change the avatar colors. By
     * default, a random theme will be selected. The random theme will persist for
     * the user's initials when reloading the same theme will always return for
     * the same initials.
     *
     * When one dimension is specified and the other is 0, the image is scaled
     * with preserved aspect ratio. If both dimensions are 0, the API provides an
     * image at source quality. If dimensions are not specified, the default size
     * of image returned is 100x100px.
     *
     *
     * @param {string} name
     * @param {number} width
     * @param {number} height
     * @param {string} background
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getInitials(name, width, height, background) {
        const apiPath = '/avatars/initials';
        const payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof background !== 'undefined') {
            payload['background'] = background;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get QR code
     *
     * Converts a given plain text to a QR code image. You can use the query
     * parameters to change the size and style of the resulting image.
     *
     *
     * @param {string} text
     * @param {number} size
     * @param {number} margin
     * @param {boolean} download
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getQR(text, size, margin, download) {
        if (typeof text === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "text"');
        }
        const apiPath = '/avatars/qr';
        const payload = {};
        if (typeof text !== 'undefined') {
            payload['text'] = text;
        }
        if (typeof size !== 'undefined') {
            payload['size'] = size;
        }
        if (typeof margin !== 'undefined') {
            payload['margin'] = margin;
        }
        if (typeof download !== 'undefined') {
            payload['download'] = download;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
}
;


/***/ }),

/***/ "./src/services/databases.ts":
/*!***********************************!*\
  !*** ./src/services/databases.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_103581__) => {

__nested_webpack_require_103581__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_103581__.d(__webpack_exports__, {
/* harmony export */   "Databases": () => (/* binding */ Databases)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_103581__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_103581__(/*! ../client */ "./src/client.ts");


class Databases extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * List documents
     *
     * Get a list of all the user's documents in a given collection. You can use
     * the query params to filter your results.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string[]} queries
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listDocuments(databaseId, collectionId, queries) {
        if (typeof databaseId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "databaseId"');
        }
        if (typeof collectionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "collectionId"');
        }
        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create document
     *
     * Create a new Document. Before using this route, you should create a new
     * collection resource using either a [server
     * integration](https://appconda.io/docs/server/databases#databasesCreateCollection)
     * API or directly from your database console.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {Omit<Document, keyof Models.Document>} data
     * @param {string[]} permissions
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createDocument(databaseId, collectionId, documentId, data, permissions) {
        if (typeof databaseId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "databaseId"');
        }
        if (typeof collectionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "collectionId"');
        }
        if (typeof documentId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "documentId"');
        }
        if (typeof data === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "data"');
        }
        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId);
        const payload = {};
        if (typeof documentId !== 'undefined') {
            payload['documentId'] = documentId;
        }
        if (typeof data !== 'undefined') {
            payload['data'] = data;
        }
        if (typeof permissions !== 'undefined') {
            payload['permissions'] = permissions;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get document
     *
     * Get a document by its unique ID. This endpoint response returns a JSON
     * object with the document data.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {string[]} queries
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getDocument(databaseId, collectionId, documentId, queries) {
        if (typeof databaseId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "databaseId"');
        }
        if (typeof collectionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "collectionId"');
        }
        if (typeof documentId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "documentId"');
        }
        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update document
     *
     * Update a document by its unique ID. Using the patch method you can pass
     * only specific fields that will get updated.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @param {Partial<Omit<Document, keyof Models.Document>>} data
     * @param {string[]} permissions
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateDocument(databaseId, collectionId, documentId, data, permissions) {
        if (typeof databaseId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "databaseId"');
        }
        if (typeof collectionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "collectionId"');
        }
        if (typeof documentId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "documentId"');
        }
        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
        const payload = {};
        if (typeof data !== 'undefined') {
            payload['data'] = data;
        }
        if (typeof permissions !== 'undefined') {
            payload['permissions'] = permissions;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete document
     *
     * Delete a document by its unique ID.
     *
     * @param {string} databaseId
     * @param {string} collectionId
     * @param {string} documentId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteDocument(databaseId, collectionId, documentId) {
        if (typeof databaseId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "databaseId"');
        }
        if (typeof collectionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "collectionId"');
        }
        if (typeof documentId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "documentId"');
        }
        const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', databaseId).replace('{collectionId}', collectionId).replace('{documentId}', documentId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
}
;


/***/ }),

/***/ "./src/services/functions.ts":
/*!***********************************!*\
  !*** ./src/services/functions.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_112293__) => {

__nested_webpack_require_112293__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_112293__.d(__webpack_exports__, {
/* harmony export */   "Functions": () => (/* binding */ Functions)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_112293__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_112293__(/*! ../client */ "./src/client.ts");


class Functions extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * List executions
     *
     * Get a list of all the current user function execution logs. You can use the
     * query params to filter your results.
     *
     * @param {string} functionId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listExecutions(functionId, queries, search) {
        if (typeof functionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "functionId"');
        }
        const apiPath = '/functions/{functionId}/executions'.replace('{functionId}', functionId);
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create execution
     *
     * Trigger a function execution. The returned object will return you the
     * current execution status. You can ping the `Get Execution` endpoint to get
     * updates on the current execution status. Once this endpoint is called, your
     * function execution process will start asynchronously.
     *
     * @param {string} functionId
     * @param {string} body
     * @param {boolean} async
     * @param {string} xpath
     * @param {ExecutionMethod} method
     * @param {object} headers
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createExecution(functionId, body, async, xpath, method, headers) {
        if (typeof functionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "functionId"');
        }
        const apiPath = '/functions/{functionId}/executions'.replace('{functionId}', functionId);
        const payload = {};
        if (typeof body !== 'undefined') {
            payload['body'] = body;
        }
        if (typeof async !== 'undefined') {
            payload['async'] = async;
        }
        if (typeof xpath !== 'undefined') {
            payload['path'] = xpath;
        }
        if (typeof method !== 'undefined') {
            payload['method'] = method;
        }
        if (typeof headers !== 'undefined') {
            payload['headers'] = headers;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get execution
     *
     * Get a function execution log by its unique ID.
     *
     * @param {string} functionId
     * @param {string} executionId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getExecution(functionId, executionId) {
        if (typeof functionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "functionId"');
        }
        if (typeof executionId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "executionId"');
        }
        const apiPath = '/functions/{functionId}/executions/{executionId}'.replace('{functionId}', functionId).replace('{executionId}', executionId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
}
;


/***/ }),

/***/ "./src/services/graphql.ts":
/*!*********************************!*\
  !*** ./src/services/graphql.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_116881__) => {

__nested_webpack_require_116881__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_116881__.d(__webpack_exports__, {
/* harmony export */   "Graphql": () => (/* binding */ Graphql)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_116881__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_116881__(/*! ../client */ "./src/client.ts");


class Graphql extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * GraphQL endpoint
     *
     * Execute a GraphQL mutation.
     *
     * @param {object} query
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async query(query) {
        if (typeof query === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "query"');
        }
        const apiPath = '/graphql';
        const payload = {};
        if (typeof query !== 'undefined') {
            payload['query'] = query;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'x-sdk-graphql': 'true',
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * GraphQL endpoint
     *
     * Execute a GraphQL mutation.
     *
     * @param {object} query
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async mutation(query) {
        if (typeof query === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "query"');
        }
        const apiPath = '/graphql/mutation';
        const payload = {};
        if (typeof query !== 'undefined') {
            payload['query'] = query;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'x-sdk-graphql': 'true',
            'content-type': 'application/json',
        }, payload);
    }
}
;


/***/ }),

/***/ "./src/services/locale.ts":
/*!********************************!*\
  !*** ./src/services/locale.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_119235__) => {

__nested_webpack_require_119235__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_119235__.d(__webpack_exports__, {
/* harmony export */   "Locale": () => (/* binding */ Locale)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_119235__(/*! ../service */ "./src/service.ts");

class Locale extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * Get user locale
     *
     * Get the current user location based on IP. Returns an object with user
     * country code, country name, continent name, continent code, ip address and
     * suggested currency. You can use the locale header to get the data in a
     * supported language.
     *
     * ([IP Geolocation by DB-IP](https://db-ip.com))
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async get() {
        const apiPath = '/locale';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List Locale Codes
     *
     * List of all locale codes in [ISO
     * 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listCodes() {
        const apiPath = '/locale/codes';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List continents
     *
     * List of all continents. You can use the locale header to get the data in a
     * supported language.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listContinents() {
        const apiPath = '/locale/continents';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List countries
     *
     * List of all countries. You can use the locale header to get the data in a
     * supported language.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listCountries() {
        const apiPath = '/locale/countries';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List EU countries
     *
     * List of all countries that are currently members of the EU. You can use the
     * locale header to get the data in a supported language.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listCountriesEU() {
        const apiPath = '/locale/countries/eu';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List countries phone codes
     *
     * List of all countries phone codes. You can use the locale header to get the
     * data in a supported language.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listCountriesPhones() {
        const apiPath = '/locale/countries/phones';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List currencies
     *
     * List of all currencies, including currency symbol, name, plural, and
     * decimal digits for all major and minor currencies. You can use the locale
     * header to get the data in a supported language.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listCurrencies() {
        const apiPath = '/locale/currencies';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List languages
     *
     * List of all languages classified by ISO 639-1 including 2-letter code, name
     * in English, and name in the respective language.
     *
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listLanguages() {
        const apiPath = '/locale/languages';
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
}
;


/***/ }),

/***/ "./src/services/messaging.ts":
/*!***********************************!*\
  !*** ./src/services/messaging.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_124486__) => {

__nested_webpack_require_124486__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_124486__.d(__webpack_exports__, {
/* harmony export */   "Messaging": () => (/* binding */ Messaging)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_124486__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_124486__(/*! ../client */ "./src/client.ts");


class Messaging extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * Create subscriber
     *
     * Create a new subscriber.
     *
     * @param {string} topicId
     * @param {string} subscriberId
     * @param {string} targetId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createSubscriber(topicId, subscriberId, targetId) {
        if (typeof topicId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "topicId"');
        }
        if (typeof subscriberId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "subscriberId"');
        }
        if (typeof targetId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "targetId"');
        }
        const apiPath = '/messaging/topics/{topicId}/subscribers'.replace('{topicId}', topicId);
        const payload = {};
        if (typeof subscriberId !== 'undefined') {
            payload['subscriberId'] = subscriberId;
        }
        if (typeof targetId !== 'undefined') {
            payload['targetId'] = targetId;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete subscriber
     *
     * Delete a subscriber by its unique ID.
     *
     * @param {string} topicId
     * @param {string} subscriberId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteSubscriber(topicId, subscriberId) {
        if (typeof topicId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "topicId"');
        }
        if (typeof subscriberId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "subscriberId"');
        }
        const apiPath = '/messaging/topics/{topicId}/subscribers/{subscriberId}'.replace('{topicId}', topicId).replace('{subscriberId}', subscriberId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
}
;


/***/ }),

/***/ "./src/services/storage.ts":
/*!*********************************!*\
  !*** ./src/services/storage.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_127709__) => {

__nested_webpack_require_127709__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_127709__.d(__webpack_exports__, {
/* harmony export */   "Storage": () => (/* binding */ Storage)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_127709__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_127709__(/*! ../client */ "./src/client.ts");


class Storage extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * List files
     *
     * Get a list of all the user files. You can use the query params to filter
     * your results.
     *
     * @param {string} bucketId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listFiles(bucketId, queries, search) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', bucketId);
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create file
     *
     * Create a new file. Before using this route, you should create a new bucket
     * resource using either a [server
     * integration](https://appconda.io/docs/server/storage#storageCreateBucket)
     * API or directly from your Appconda console.
     *
     * Larger files should be uploaded using multiple requests with the
     * [content-range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range)
     * header to send a partial request with a maximum supported chunk of `5MB`.
     * The `content-range` header values should always be in bytes.
     *
     * When the first request is sent, the server will return the **File** object,
     * and the subsequent part request must include the file's **id** in
     * `x-appconda-id` header to allow the server to know that the partial upload
     * is for the existing file and not for a new one.
     *
     * If you're creating a new file using one of the Appconda SDKs, all the
     * chunking logic will be managed by the SDK internally.
     *
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {File} file
     * @param {string[]} permissions
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createFile(bucketId, fileId, file, permissions, onProgress = (progress) => { }) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "fileId"');
        }
        if (typeof file === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "file"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', bucketId);
        const payload = {};
        if (typeof fileId !== 'undefined') {
            payload['fileId'] = fileId;
        }
        if (typeof file !== 'undefined') {
            payload['file'] = file;
        }
        if (typeof permissions !== 'undefined') {
            payload['permissions'] = permissions;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        if (!(file instanceof File)) {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Parameter "file" has to be a File.');
        }
        const size = file.size;
        if (size <= _service__WEBPACK_IMPORTED_MODULE_0__.Service.CHUNK_SIZE) {
            return await this.client.call('post', uri, {
                'content-type': 'multipart/form-data',
            }, payload);
        }
        const apiHeaders = {
            'content-type': 'multipart/form-data',
        };
        let offset = 0;
        let response = undefined;
        if (fileId != 'unique()') {
            try {
                response = await this.client.call('GET', new URL(this.client.config.endpoint + apiPath + '/' + fileId), apiHeaders);
                offset = response.chunksUploaded * _service__WEBPACK_IMPORTED_MODULE_0__.Service.CHUNK_SIZE;
            }
            catch (e) {
            }
        }
        while (offset < size) {
            let end = Math.min(offset + _service__WEBPACK_IMPORTED_MODULE_0__.Service.CHUNK_SIZE - 1, size - 1);
            apiHeaders['content-range'] = 'bytes ' + offset + '-' + end + '/' + size;
            if (response && response.$id) {
                apiHeaders['x-appconda-id'] = response.$id;
            }
            const chunk = file.slice(offset, end + 1);
            payload['file'] = new File([chunk], file.name);
            response = await this.client.call('post', uri, apiHeaders, payload);
            if (onProgress) {
                onProgress({
                    $id: response.$id,
                    progress: (offset / size) * 100,
                    sizeUploaded: offset,
                    chunksTotal: response.chunksTotal,
                    chunksUploaded: response.chunksUploaded
                });
            }
            offset += _service__WEBPACK_IMPORTED_MODULE_0__.Service.CHUNK_SIZE;
        }
        return response;
    }
    /**
     * Get file
     *
     * Get a file by its unique ID. This endpoint response returns a JSON object
     * with the file metadata.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getFile(bucketId, fileId) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update file
     *
     * Update a file by its unique ID. Only users with write permissions have
     * access to update this resource.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {string} name
     * @param {string[]} permissions
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateFile(bucketId, fileId, name, permissions) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof permissions !== 'undefined') {
            payload['permissions'] = permissions;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete File
     *
     * Delete a file by its unique ID. Only users with write permissions have
     * access to delete this resource.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteFile(bucketId, fileId) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get file for download
     *
     * Get a file content by its unique ID. The endpoint response return with a
     * 'Content-Disposition: attachment' header that tells the browser to start
     * downloading the file to user downloads directory.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getFileDownload(bucketId, fileId) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/download'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get file preview
     *
     * Get a file preview image. Currently, this method supports preview for image
     * files (jpg, png, and gif), other supported formats, like pdf, docs, slides,
     * and spreadsheets, will return the file icon image. You can also pass query
     * string arguments for cutting and resizing your preview image. Preview is
     * supported only for image files smaller than 10MB.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @param {number} width
     * @param {number} height
     * @param {ImageGravity} gravity
     * @param {number} quality
     * @param {number} borderWidth
     * @param {string} borderColor
     * @param {number} borderRadius
     * @param {number} opacity
     * @param {number} rotation
     * @param {string} background
     * @param {ImageFormat} output
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getFilePreview(bucketId, fileId, width, height, gravity, quality, borderWidth, borderColor, borderRadius, opacity, rotation, background, output) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/preview'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        if (typeof width !== 'undefined') {
            payload['width'] = width;
        }
        if (typeof height !== 'undefined') {
            payload['height'] = height;
        }
        if (typeof gravity !== 'undefined') {
            payload['gravity'] = gravity;
        }
        if (typeof quality !== 'undefined') {
            payload['quality'] = quality;
        }
        if (typeof borderWidth !== 'undefined') {
            payload['borderWidth'] = borderWidth;
        }
        if (typeof borderColor !== 'undefined') {
            payload['borderColor'] = borderColor;
        }
        if (typeof borderRadius !== 'undefined') {
            payload['borderRadius'] = borderRadius;
        }
        if (typeof opacity !== 'undefined') {
            payload['opacity'] = opacity;
        }
        if (typeof rotation !== 'undefined') {
            payload['rotation'] = rotation;
        }
        if (typeof background !== 'undefined') {
            payload['background'] = background;
        }
        if (typeof output !== 'undefined') {
            payload['output'] = output;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
    /**
     * Get file for view
     *
     * Get a file content by its unique ID. This endpoint is similar to the
     * download method but returns with no  'Content-Disposition: attachment'
     * header.
     *
     * @param {string} bucketId
     * @param {string} fileId
     * @throws {AppcondaException}
     * @returns {URL}
    */
    getFileView(bucketId, fileId) {
        if (typeof bucketId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "bucketId"');
        }
        if (typeof fileId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "fileId"');
        }
        const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/view'.replace('{bucketId}', bucketId).replace('{fileId}', fileId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        payload['project'] = this.client.config.project;
        for (const [key, value] of Object.entries(_service__WEBPACK_IMPORTED_MODULE_0__.Service.flatten(payload))) {
            uri.searchParams.append(key, value);
        }
        return uri;
    }
}
;


/***/ }),

/***/ "./src/services/teams.ts":
/*!*******************************!*\
  !*** ./src/services/teams.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __nested_webpack_require_142756__) => {

__nested_webpack_require_142756__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_142756__.d(__webpack_exports__, {
/* harmony export */   "Teams": () => (/* binding */ Teams)
/* harmony export */ });
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_142756__(/*! ../service */ "./src/service.ts");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_142756__(/*! ../client */ "./src/client.ts");


class Teams extends _service__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(client) {
        super(client);
    }
    /**
     * List teams
     *
     * Get a list of all the teams in which the current user is a member. You can
     * use the parameters to filter your results.
     *
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async list(queries, search) {
        const apiPath = '/teams';
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create team
     *
     * Create a new team. The user who creates the team will automatically be
     * assigned as the owner of the team. Only the users with the owner role can
     * invite new members, add new owners and delete or update the team.
     *
     * @param {string} teamId
     * @param {string} name
     * @param {string[]} roles
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async create(teamId, name, roles) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof name === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "name"');
        }
        const apiPath = '/teams';
        const payload = {};
        if (typeof teamId !== 'undefined') {
            payload['teamId'] = teamId;
        }
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        if (typeof roles !== 'undefined') {
            payload['roles'] = roles;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get team
     *
     * Get a team by its ID. All team members have read access for this resource.
     *
     * @param {string} teamId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async get(teamId) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        const apiPath = '/teams/{teamId}'.replace('{teamId}', teamId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update name
     *
     * Update the team's name by its unique ID.
     *
     * @param {string} teamId
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateName(teamId, name) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof name === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "name"');
        }
        const apiPath = '/teams/{teamId}'.replace('{teamId}', teamId);
        const payload = {};
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete team
     *
     * Delete a team using its ID. Only team members with the owner role can
     * delete the team.
     *
     * @param {string} teamId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async delete(teamId) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        const apiPath = '/teams/{teamId}'.replace('{teamId}', teamId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * List team memberships
     *
     * Use this endpoint to list a team's members using the team's ID. All team
     * members have read access to this endpoint.
     *
     * @param {string} teamId
     * @param {string[]} queries
     * @param {string} search
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async listMemberships(teamId, queries, search) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        const apiPath = '/teams/{teamId}/memberships'.replace('{teamId}', teamId);
        const payload = {};
        if (typeof queries !== 'undefined') {
            payload['queries'] = queries;
        }
        if (typeof search !== 'undefined') {
            payload['search'] = search;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Create team membership
     *
     * Invite a new member to join your team. Provide an ID for existing users, or
     * invite unregistered users using an email or phone number. If initiated from
     * a Client SDK, Appconda will send an email or sms with a link to join the
     * team to the invited user, and an account will be created for them if one
     * doesn't exist. If initiated from a Server SDK, the new member will be added
     * automatically to the team.
     *
     * You only need to provide one of a user ID, email, or phone number. Appconda
     * will prioritize accepting the user ID > email > phone number if you provide
     * more than one of these parameters.
     *
     * Use the `url` parameter to redirect the user from the invitation email to
     * your app. After the user is redirected, use the [Update Team Membership
     * Status](https://appconda.io/docs/references/cloud/client-web/teams#updateMembershipStatus)
     * endpoint to allow the user to accept the invitation to the team.
     *
     * Please note that to avoid a [Redirect
     * Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md)
     * Appconda will accept the only redirect URLs under the domains you have
     * added as a platform on the Appconda Console.
     *
     *
     * @param {string} teamId
     * @param {string[]} roles
     * @param {string} email
     * @param {string} userId
     * @param {string} phone
     * @param {string} url
     * @param {string} name
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async createMembership(teamId, roles, email, userId, phone, url, name) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof roles === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "roles"');
        }
        const apiPath = '/teams/{teamId}/memberships'.replace('{teamId}', teamId);
        const payload = {};
        if (typeof email !== 'undefined') {
            payload['email'] = email;
        }
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof phone !== 'undefined') {
            payload['phone'] = phone;
        }
        if (typeof roles !== 'undefined') {
            payload['roles'] = roles;
        }
        if (typeof url !== 'undefined') {
            payload['url'] = url;
        }
        if (typeof name !== 'undefined') {
            payload['name'] = name;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('post', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get team membership
     *
     * Get a team member by the membership unique id. All team members have read
     * access for this resource.
     *
     * @param {string} teamId
     * @param {string} membershipId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getMembership(teamId, membershipId) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof membershipId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "membershipId"');
        }
        const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update membership
     *
     * Modify the roles of a team member. Only team members with the owner role
     * have access to this endpoint. Learn more about [roles and
     * permissions](https://appconda.io/docs/permissions).
     *
     *
     * @param {string} teamId
     * @param {string} membershipId
     * @param {string[]} roles
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateMembership(teamId, membershipId, roles) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof membershipId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "membershipId"');
        }
        if (typeof roles === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "roles"');
        }
        const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
        const payload = {};
        if (typeof roles !== 'undefined') {
            payload['roles'] = roles;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Delete team membership
     *
     * This endpoint allows a user to leave a team or for a team owner to delete
     * the membership of any other team member. You can also use this endpoint to
     * delete a user membership even if it is not accepted.
     *
     * @param {string} teamId
     * @param {string} membershipId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async deleteMembership(teamId, membershipId) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof membershipId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "membershipId"');
        }
        const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('delete', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update team membership status
     *
     * Use this endpoint to allow a user to accept an invitation to join a team
     * after being redirected back to your app from the invitation email received
     * by the user.
     *
     * If the request is successful, a session for the user is automatically
     * created.
     *
     *
     * @param {string} teamId
     * @param {string} membershipId
     * @param {string} userId
     * @param {string} secret
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updateMembershipStatus(teamId, membershipId, userId, secret) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof membershipId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "membershipId"');
        }
        if (typeof userId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "userId"');
        }
        if (typeof secret === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "secret"');
        }
        const apiPath = '/teams/{teamId}/memberships/{membershipId}/status'.replace('{teamId}', teamId).replace('{membershipId}', membershipId);
        const payload = {};
        if (typeof userId !== 'undefined') {
            payload['userId'] = userId;
        }
        if (typeof secret !== 'undefined') {
            payload['secret'] = secret;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('patch', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Get team preferences
     *
     * Get the team's shared preferences by its unique ID. If a preference doesn't
     * need to be shared by all team members, prefer storing them in [user
     * preferences](https://appconda.io/docs/references/cloud/client-web/account#getPrefs).
     *
     * @param {string} teamId
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async getPrefs(teamId) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        const apiPath = '/teams/{teamId}/prefs'.replace('{teamId}', teamId);
        const payload = {};
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('get', uri, {
            'content-type': 'application/json',
        }, payload);
    }
    /**
     * Update preferences
     *
     * Update the team's preferences by its unique ID. The object you pass is
     * stored as is and replaces any previous value. The maximum allowed prefs
     * size is 64kB and throws an error if exceeded.
     *
     * @param {string} teamId
     * @param {object} prefs
     * @throws {AppcondaException}
     * @returns {Promise}
    */
    async updatePrefs(teamId, prefs) {
        if (typeof teamId === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "teamId"');
        }
        if (typeof prefs === 'undefined') {
            throw new _client__WEBPACK_IMPORTED_MODULE_1__.AppcondaException('Missing required parameter: "prefs"');
        }
        const apiPath = '/teams/{teamId}/prefs'.replace('{teamId}', teamId);
        const payload = {};
        if (typeof prefs !== 'undefined') {
            payload['prefs'] = prefs;
        }
        const uri = new URL(this.client.config.endpoint + apiPath);
        return await this.client.call('put', uri, {
            'content-type': 'application/json',
        }, payload);
    }
}
;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_159770__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_159770__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_159770__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_159770__.o(definition, key) && !__nested_webpack_require_159770__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nested_webpack_require_159770__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nested_webpack_require_159770__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__nested_webpack_require_159770__.r(__webpack_exports__);
/* harmony export */ __nested_webpack_require_159770__.d(__webpack_exports__, {
/* harmony export */   "Client": () => (/* reexport safe */ _client__WEBPACK_IMPORTED_MODULE_0__.Client),
/* harmony export */   "Query": () => (/* reexport safe */ _client__WEBPACK_IMPORTED_MODULE_0__.Query),
/* harmony export */   "AppcondaException": () => (/* reexport safe */ _client__WEBPACK_IMPORTED_MODULE_0__.AppcondaException),
/* harmony export */   "Account": () => (/* reexport safe */ _services_account__WEBPACK_IMPORTED_MODULE_1__.Account),
/* harmony export */   "Avatars": () => (/* reexport safe */ _services_avatars__WEBPACK_IMPORTED_MODULE_2__.Avatars),
/* harmony export */   "Databases": () => (/* reexport safe */ _services_databases__WEBPACK_IMPORTED_MODULE_3__.Databases),
/* harmony export */   "Functions": () => (/* reexport safe */ _services_functions__WEBPACK_IMPORTED_MODULE_4__.Functions),
/* harmony export */   "Graphql": () => (/* reexport safe */ _services_graphql__WEBPACK_IMPORTED_MODULE_5__.Graphql),
/* harmony export */   "Locale": () => (/* reexport safe */ _services_locale__WEBPACK_IMPORTED_MODULE_6__.Locale),
/* harmony export */   "Messaging": () => (/* reexport safe */ _services_messaging__WEBPACK_IMPORTED_MODULE_7__.Messaging),
/* harmony export */   "Storage": () => (/* reexport safe */ _services_storage__WEBPACK_IMPORTED_MODULE_8__.Storage),
/* harmony export */   "Teams": () => (/* reexport safe */ _services_teams__WEBPACK_IMPORTED_MODULE_9__.Teams),
/* harmony export */   "Permission": () => (/* reexport safe */ _permission__WEBPACK_IMPORTED_MODULE_10__.Permission),
/* harmony export */   "Role": () => (/* reexport safe */ _role__WEBPACK_IMPORTED_MODULE_11__.Role),
/* harmony export */   "ID": () => (/* reexport safe */ _id__WEBPACK_IMPORTED_MODULE_12__.ID),
/* harmony export */   "AuthenticatorType": () => (/* reexport safe */ _enums_authenticator_type__WEBPACK_IMPORTED_MODULE_13__.AuthenticatorType),
/* harmony export */   "AuthenticationFactor": () => (/* reexport safe */ _enums_authentication_factor__WEBPACK_IMPORTED_MODULE_14__.AuthenticationFactor),
/* harmony export */   "OAuthProvider": () => (/* reexport safe */ _enums_o_auth_provider__WEBPACK_IMPORTED_MODULE_15__.OAuthProvider),
/* harmony export */   "Browser": () => (/* reexport safe */ _enums_browser__WEBPACK_IMPORTED_MODULE_16__.Browser),
/* harmony export */   "CreditCard": () => (/* reexport safe */ _enums_credit_card__WEBPACK_IMPORTED_MODULE_17__.CreditCard),
/* harmony export */   "Flag": () => (/* reexport safe */ _enums_flag__WEBPACK_IMPORTED_MODULE_18__.Flag),
/* harmony export */   "ExecutionMethod": () => (/* reexport safe */ _enums_execution_method__WEBPACK_IMPORTED_MODULE_19__.ExecutionMethod),
/* harmony export */   "ImageGravity": () => (/* reexport safe */ _enums_image_gravity__WEBPACK_IMPORTED_MODULE_20__.ImageGravity),
/* harmony export */   "ImageFormat": () => (/* reexport safe */ _enums_image_format__WEBPACK_IMPORTED_MODULE_21__.ImageFormat)
/* harmony export */ });
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_159770__(/*! ./client */ "./src/client.ts");
/* harmony import */ var _services_account__WEBPACK_IMPORTED_MODULE_1__ = __nested_webpack_require_159770__(/*! ./services/account */ "./src/services/account.ts");
/* harmony import */ var _services_avatars__WEBPACK_IMPORTED_MODULE_2__ = __nested_webpack_require_159770__(/*! ./services/avatars */ "./src/services/avatars.ts");
/* harmony import */ var _services_databases__WEBPACK_IMPORTED_MODULE_3__ = __nested_webpack_require_159770__(/*! ./services/databases */ "./src/services/databases.ts");
/* harmony import */ var _services_functions__WEBPACK_IMPORTED_MODULE_4__ = __nested_webpack_require_159770__(/*! ./services/functions */ "./src/services/functions.ts");
/* harmony import */ var _services_graphql__WEBPACK_IMPORTED_MODULE_5__ = __nested_webpack_require_159770__(/*! ./services/graphql */ "./src/services/graphql.ts");
/* harmony import */ var _services_locale__WEBPACK_IMPORTED_MODULE_6__ = __nested_webpack_require_159770__(/*! ./services/locale */ "./src/services/locale.ts");
/* harmony import */ var _services_messaging__WEBPACK_IMPORTED_MODULE_7__ = __nested_webpack_require_159770__(/*! ./services/messaging */ "./src/services/messaging.ts");
/* harmony import */ var _services_storage__WEBPACK_IMPORTED_MODULE_8__ = __nested_webpack_require_159770__(/*! ./services/storage */ "./src/services/storage.ts");
/* harmony import */ var _services_teams__WEBPACK_IMPORTED_MODULE_9__ = __nested_webpack_require_159770__(/*! ./services/teams */ "./src/services/teams.ts");
/* harmony import */ var _permission__WEBPACK_IMPORTED_MODULE_10__ = __nested_webpack_require_159770__(/*! ./permission */ "./src/permission.ts");
/* harmony import */ var _role__WEBPACK_IMPORTED_MODULE_11__ = __nested_webpack_require_159770__(/*! ./role */ "./src/role.ts");
/* harmony import */ var _id__WEBPACK_IMPORTED_MODULE_12__ = __nested_webpack_require_159770__(/*! ./id */ "./src/id.ts");
/* harmony import */ var _enums_authenticator_type__WEBPACK_IMPORTED_MODULE_13__ = __nested_webpack_require_159770__(/*! ./enums/authenticator-type */ "./src/enums/authenticator-type.ts");
/* harmony import */ var _enums_authentication_factor__WEBPACK_IMPORTED_MODULE_14__ = __nested_webpack_require_159770__(/*! ./enums/authentication-factor */ "./src/enums/authentication-factor.ts");
/* harmony import */ var _enums_o_auth_provider__WEBPACK_IMPORTED_MODULE_15__ = __nested_webpack_require_159770__(/*! ./enums/o-auth-provider */ "./src/enums/o-auth-provider.ts");
/* harmony import */ var _enums_browser__WEBPACK_IMPORTED_MODULE_16__ = __nested_webpack_require_159770__(/*! ./enums/browser */ "./src/enums/browser.ts");
/* harmony import */ var _enums_credit_card__WEBPACK_IMPORTED_MODULE_17__ = __nested_webpack_require_159770__(/*! ./enums/credit-card */ "./src/enums/credit-card.ts");
/* harmony import */ var _enums_flag__WEBPACK_IMPORTED_MODULE_18__ = __nested_webpack_require_159770__(/*! ./enums/flag */ "./src/enums/flag.ts");
/* harmony import */ var _enums_execution_method__WEBPACK_IMPORTED_MODULE_19__ = __nested_webpack_require_159770__(/*! ./enums/execution-method */ "./src/enums/execution-method.ts");
/* harmony import */ var _enums_image_gravity__WEBPACK_IMPORTED_MODULE_20__ = __nested_webpack_require_159770__(/*! ./enums/image-gravity */ "./src/enums/image-gravity.ts");
/* harmony import */ var _enums_image_format__WEBPACK_IMPORTED_MODULE_21__ = __nested_webpack_require_159770__(/*! ./enums/image-format */ "./src/enums/image-format.ts");























})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=index.js.map
// console.log('forms-core module loaded.');


/***/ }),

/***/ "./node_modules/@emotion/cache/dist/emotion-cache.browser.development.esm.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@emotion/cache/dist/emotion-cache.browser.development.esm.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createCache)
/* harmony export */ });
/* harmony import */ var _emotion_sheet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/sheet */ "./node_modules/@emotion/sheet/dist/emotion-sheet.development.esm.js");
/* harmony import */ var stylis__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! stylis */ "./node_modules/stylis/src/Tokenizer.js");
/* harmony import */ var stylis__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! stylis */ "./node_modules/stylis/src/Utility.js");
/* harmony import */ var stylis__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! stylis */ "./node_modules/stylis/src/Enum.js");
/* harmony import */ var stylis__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! stylis */ "./node_modules/stylis/src/Serializer.js");
/* harmony import */ var stylis__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! stylis */ "./node_modules/stylis/src/Middleware.js");
/* harmony import */ var stylis__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! stylis */ "./node_modules/stylis/src/Parser.js");
/* harmony import */ var _emotion_weak_memoize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/weak-memoize */ "./node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js");
/* harmony import */ var _emotion_memoize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @emotion/memoize */ "./node_modules/@emotion/memoize/dist/emotion-memoize.esm.js");





var identifierWithPointTracking = function identifierWithPointTracking(begin, points, index) {
  var previous = 0;
  var character = 0;

  while (true) {
    previous = character;
    character = (0,stylis__WEBPACK_IMPORTED_MODULE_3__.peek)(); // &\f

    if (previous === 38 && character === 12) {
      points[index] = 1;
    }

    if ((0,stylis__WEBPACK_IMPORTED_MODULE_3__.token)(character)) {
      break;
    }

    (0,stylis__WEBPACK_IMPORTED_MODULE_3__.next)();
  }

  return (0,stylis__WEBPACK_IMPORTED_MODULE_3__.slice)(begin, stylis__WEBPACK_IMPORTED_MODULE_3__.position);
};

var toRules = function toRules(parsed, points) {
  // pretend we've started with a comma
  var index = -1;
  var character = 44;

  do {
    switch ((0,stylis__WEBPACK_IMPORTED_MODULE_3__.token)(character)) {
      case 0:
        // &\f
        if (character === 38 && (0,stylis__WEBPACK_IMPORTED_MODULE_3__.peek)() === 12) {
          // this is not 100% correct, we don't account for literal sequences here - like for example quoted strings
          // stylis inserts \f after & to know when & where it should replace this sequence with the context selector
          // and when it should just concatenate the outer and inner selectors
          // it's very unlikely for this sequence to actually appear in a different context, so we just leverage this fact here
          points[index] = 1;
        }

        parsed[index] += identifierWithPointTracking(stylis__WEBPACK_IMPORTED_MODULE_3__.position - 1, points, index);
        break;

      case 2:
        parsed[index] += (0,stylis__WEBPACK_IMPORTED_MODULE_3__.delimit)(character);
        break;

      case 4:
        // comma
        if (character === 44) {
          // colon
          parsed[++index] = (0,stylis__WEBPACK_IMPORTED_MODULE_3__.peek)() === 58 ? '&\f' : '';
          points[index] = parsed[index].length;
          break;
        }

      // fallthrough

      default:
        parsed[index] += (0,stylis__WEBPACK_IMPORTED_MODULE_4__.from)(character);
    }
  } while (character = (0,stylis__WEBPACK_IMPORTED_MODULE_3__.next)());

  return parsed;
};

var getRules = function getRules(value, points) {
  return (0,stylis__WEBPACK_IMPORTED_MODULE_3__.dealloc)(toRules((0,stylis__WEBPACK_IMPORTED_MODULE_3__.alloc)(value), points));
}; // WeakSet would be more appropriate, but only WeakMap is supported in IE11


var fixedElements = /* #__PURE__ */new WeakMap();
var compat = function compat(element) {
  if (element.type !== 'rule' || !element.parent || // positive .length indicates that this rule contains pseudo
  // negative .length indicates that this rule has been already prefixed
  element.length < 1) {
    return;
  }

  var value = element.value,
      parent = element.parent;
  var isImplicitRule = element.column === parent.column && element.line === parent.line;

  while (parent.type !== 'rule') {
    parent = parent.parent;
    if (!parent) return;
  } // short-circuit for the simplest case


  if (element.props.length === 1 && value.charCodeAt(0) !== 58
  /* colon */
  && !fixedElements.get(parent)) {
    return;
  } // if this is an implicitly inserted rule (the one eagerly inserted at the each new nested level)
  // then the props has already been manipulated beforehand as they that array is shared between it and its "rule parent"


  if (isImplicitRule) {
    return;
  }

  fixedElements.set(element, true);
  var points = [];
  var rules = getRules(value, points);
  var parentRules = parent.props;

  for (var i = 0, k = 0; i < rules.length; i++) {
    for (var j = 0; j < parentRules.length; j++, k++) {
      element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
    }
  }
};
var removeLabel = function removeLabel(element) {
  if (element.type === 'decl') {
    var value = element.value;

    if ( // charcode for l
    value.charCodeAt(0) === 108 && // charcode for b
    value.charCodeAt(2) === 98) {
      // this ignores label
      element["return"] = '';
      element.value = '';
    }
  }
};
var ignoreFlag = 'emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason';

var isIgnoringComment = function isIgnoringComment(element) {
  return element.type === 'comm' && element.children.indexOf(ignoreFlag) > -1;
};

var createUnsafeSelectorsAlarm = function createUnsafeSelectorsAlarm(cache) {
  return function (element, index, children) {
    if (element.type !== 'rule' || cache.compat) return;
    var unsafePseudoClasses = element.value.match(/(:first|:nth|:nth-last)-child/g);

    if (unsafePseudoClasses) {
      var isNested = !!element.parent; // in nested rules comments become children of the "auto-inserted" rule and that's always the `element.parent`
      //
      // considering this input:
      // .a {
      //   .b /* comm */ {}
      //   color: hotpink;
      // }
      // we get output corresponding to this:
      // .a {
      //   & {
      //     /* comm */
      //     color: hotpink;
      //   }
      //   .b {}
      // }

      var commentContainer = isNested ? element.parent.children : // global rule at the root level
      children;

      for (var i = commentContainer.length - 1; i >= 0; i--) {
        var node = commentContainer[i];

        if (node.line < element.line) {
          break;
        } // it is quite weird but comments are *usually* put at `column: element.column - 1`
        // so we seek *from the end* for the node that is earlier than the rule's `element` and check that
        // this will also match inputs like this:
        // .a {
        //   /* comm */
        //   .b {}
        // }
        //
        // but that is fine
        //
        // it would be the easiest to change the placement of the comment to be the first child of the rule:
        // .a {
        //   .b { /* comm */ }
        // }
        // with such inputs we wouldn't have to search for the comment at all
        // TODO: consider changing this comment placement in the next major version


        if (node.column < element.column) {
          if (isIgnoringComment(node)) {
            return;
          }

          break;
        }
      }

      unsafePseudoClasses.forEach(function (unsafePseudoClass) {
        console.error("The pseudo class \"" + unsafePseudoClass + "\" is potentially unsafe when doing server-side rendering. Try changing it to \"" + unsafePseudoClass.split('-child')[0] + "-of-type\".");
      });
    }
  };
};

var isImportRule = function isImportRule(element) {
  return element.type.charCodeAt(1) === 105 && element.type.charCodeAt(0) === 64;
};

var isPrependedWithRegularRules = function isPrependedWithRegularRules(index, children) {
  for (var i = index - 1; i >= 0; i--) {
    if (!isImportRule(children[i])) {
      return true;
    }
  }

  return false;
}; // use this to remove incorrect elements from further processing
// so they don't get handed to the `sheet` (or anything else)
// as that could potentially lead to additional logs which in turn could be overhelming to the user


var nullifyElement = function nullifyElement(element) {
  element.type = '';
  element.value = '';
  element["return"] = '';
  element.children = '';
  element.props = '';
};

var incorrectImportAlarm = function incorrectImportAlarm(element, index, children) {
  if (!isImportRule(element)) {
    return;
  }

  if (element.parent) {
    console.error("`@import` rules can't be nested inside other rules. Please move it to the top level and put it before regular rules. Keep in mind that they can only be used within global styles.");
    nullifyElement(element);
  } else if (isPrependedWithRegularRules(index, children)) {
    console.error("`@import` rules can't be after other rules. Please put your `@import` rules before your other rules.");
    nullifyElement(element);
  }
};

/* eslint-disable no-fallthrough */

function prefix(value, length) {
  switch ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.hash)(value, length)) {
    // color-adjust
    case 5103:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + 'print-' + value + value;
    // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)

    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921: // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break

    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005: // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,

    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855: // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)

    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + value;
    // appearance, user-select, transform, hyphens, text-size-adjust

    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MOZ + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + value + value;
    // flex, flex-direction

    case 6828:
    case 4268:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + value + value;
    // order

    case 6165:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + 'flex-' + value + value;
    // align-items

    case 5187:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /(\w+).+(:[^]+)/, stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + 'box-$1$2' + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + 'flex-$1$2') + value;
    // align-self

    case 5443:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + 'flex-item-' + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /flex-|-self/, '') + value;
    // align-content

    case 4675:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + 'flex-line-pack' + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /align-content|flex-|-self/, '') + value;
    // flex-shrink

    case 5548:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, 'shrink', 'negative') + value;
    // flex-basis

    case 5292:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, 'basis', 'preferred-size') + value;
    // flex-grow

    case 6060:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + 'box-' + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, '-grow', '') + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, 'grow', 'positive') + value;
    // transition

    case 4554:
      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /([^-])(transform)/g, '$1' + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + '$2') + value;
    // cursor

    case 6187:
      return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)((0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)((0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /(zoom-|grab)/, stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + '$1'), /(image-set)/, stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + '$1'), value, '') + value;
    // background, background-image

    case 5495:
    case 3959:
      return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /(image-set\([^]*)/, stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + '$1' + '$`$1');
    // justify-content

    case 4968:
      return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)((0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /(.+:)(flex-)?(.*)/, stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + 'box-pack:$3' + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + value;
    // (margin|padding)-inline-(start|end)

    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /(.+)-inline(.+)/, stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + '$1$2') + value;
    // (min|max)?(width|height|inline-size|block-size)

    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      // stretch, max-content, min-content, fill-available
      if ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.strlen)(value) - 1 - length > 6) switch ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.charat)(value, length + 1)) {
        // (m)ax-content, (m)in-content
        case 109:
          // -
          if ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.charat)(value, length + 4) !== 45) break;
        // (f)ill-available, (f)it-content

        case 102:
          return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /(.+:)(.+)-([^]+)/, '$1' + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + '$2-$3' + '$1' + stylis__WEBPACK_IMPORTED_MODULE_5__.MOZ + ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.charat)(value, length + 3) == 108 ? '$3' : '$2-$3')) + value;
        // (s)tretch

        case 115:
          return ~(0,stylis__WEBPACK_IMPORTED_MODULE_4__.indexof)(value, 'stretch') ? prefix((0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, 'stretch', 'fill-available'), length) + value : value;
      }
      break;
    // position: sticky

    case 4949:
      // (s)ticky?
      if ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.charat)(value, length + 1) !== 115) break;
    // display: (flex|inline-flex)

    case 6444:
      switch ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.charat)(value, (0,stylis__WEBPACK_IMPORTED_MODULE_4__.strlen)(value) - 3 - (~(0,stylis__WEBPACK_IMPORTED_MODULE_4__.indexof)(value, '!important') && 10))) {
        // stic(k)y
        case 107:
          return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, ':', ':' + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT) + value;
        // (inline-)?fl(e)x

        case 101:
          return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /(.+:)([^;!]+)(;|!.+)?/, '$1' + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.charat)(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + '$2$3' + '$1' + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + '$2box$3') + value;
      }

      break;
    // writing-mode

    case 5936:
      switch ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.charat)(value, length + 11)) {
        // vertical-l(r)
        case 114:
          return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /[svh]\w+-[tblr]{2}/, 'tb') + value;
        // vertical-r(l)

        case 108:
          return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value;
        // horizontal(-)tb

        case 45:
          return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /[svh]\w+-[tblr]{2}/, 'lr') + value;
      }

      return stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + value + stylis__WEBPACK_IMPORTED_MODULE_5__.MS + value + value;
  }

  return value;
}

var prefixer = function prefixer(element, index, children, callback) {
  if (element.length > -1) if (!element["return"]) switch (element.type) {
    case stylis__WEBPACK_IMPORTED_MODULE_5__.DECLARATION:
      element["return"] = prefix(element.value, element.length);
      break;

    case stylis__WEBPACK_IMPORTED_MODULE_5__.KEYFRAMES:
      return (0,stylis__WEBPACK_IMPORTED_MODULE_6__.serialize)([(0,stylis__WEBPACK_IMPORTED_MODULE_3__.copy)(element, {
        value: (0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(element.value, '@', '@' + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT)
      })], callback);

    case stylis__WEBPACK_IMPORTED_MODULE_5__.RULESET:
      if (element.length) return (0,stylis__WEBPACK_IMPORTED_MODULE_4__.combine)(element.props, function (value) {
        switch ((0,stylis__WEBPACK_IMPORTED_MODULE_4__.match)(value, /(::plac\w+|:read-\w+)/)) {
          // :read-(only|write)
          case ':read-only':
          case ':read-write':
            return (0,stylis__WEBPACK_IMPORTED_MODULE_6__.serialize)([(0,stylis__WEBPACK_IMPORTED_MODULE_3__.copy)(element, {
              props: [(0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /:(read-\w+)/, ':' + stylis__WEBPACK_IMPORTED_MODULE_5__.MOZ + '$1')]
            })], callback);
          // :placeholder

          case '::placeholder':
            return (0,stylis__WEBPACK_IMPORTED_MODULE_6__.serialize)([(0,stylis__WEBPACK_IMPORTED_MODULE_3__.copy)(element, {
              props: [(0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /:(plac\w+)/, ':' + stylis__WEBPACK_IMPORTED_MODULE_5__.WEBKIT + 'input-$1')]
            }), (0,stylis__WEBPACK_IMPORTED_MODULE_3__.copy)(element, {
              props: [(0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /:(plac\w+)/, ':' + stylis__WEBPACK_IMPORTED_MODULE_5__.MOZ + '$1')]
            }), (0,stylis__WEBPACK_IMPORTED_MODULE_3__.copy)(element, {
              props: [(0,stylis__WEBPACK_IMPORTED_MODULE_4__.replace)(value, /:(plac\w+)/, stylis__WEBPACK_IMPORTED_MODULE_5__.MS + 'input-$1')]
            })], callback);
        }

        return '';
      });
  }
};

var defaultStylisPlugins = [prefixer];

var createCache = function
  /*: EmotionCache */
createCache(options
/*: Options */
) {
  var key = options.key;

  if (!key) {
    throw new Error("You have to configure `key` for your cache. Please make sure it's unique (and not equal to 'css') as it's used for linking styles to your cache.\n" + "If multiple caches share the same key they might \"fight\" for each other's style elements.");
  }

  if (key === 'css') {
    var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])"); // get SSRed styles out of the way of React's hydration
    // document.head is a safe place to move them to(though note document.head is not necessarily the last place they will be)
    // note this very very intentionally targets all style elements regardless of the key to ensure
    // that creating a cache works inside of render of a React component

    Array.prototype.forEach.call(ssrStyles, function (node
    /*: HTMLStyleElement */
    ) {
      // we want to only move elements which have a space in the data-emotion attribute value
      // because that indicates that it is an Emotion 11 server-side rendered style elements
      // while we will already ignore Emotion 11 client-side inserted styles because of the :not([data-s]) part in the selector
      // Emotion 10 client-side inserted styles did not have data-s (but importantly did not have a space in their data-emotion attributes)
      // so checking for the space ensures that loading Emotion 11 after Emotion 10 has inserted some styles
      // will not result in the Emotion 10 styles being destroyed
      var dataEmotionAttribute = node.getAttribute('data-emotion');

      if (dataEmotionAttribute.indexOf(' ') === -1) {
        return;
      }

      document.head.appendChild(node);
      node.setAttribute('data-s', '');
    });
  }

  var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;

  {
    if (/[^a-z-]/.test(key)) {
      throw new Error("Emotion key must only contain lower case alphabetical characters and - but \"" + key + "\" was passed");
    }
  }

  var inserted = {};
  var container;
  /* : Node */

  var nodesToHydrate = [];

  {
    container = options.container || document.head;
    Array.prototype.forEach.call( // this means we will ignore elements which don't have a space in them which
    // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
    document.querySelectorAll("style[data-emotion^=\"" + key + " \"]"), function (node
    /*: HTMLStyleElement */
    ) {
      var attrib = node.getAttribute("data-emotion").split(' ');

      for (var i = 1; i < attrib.length; i++) {
        inserted[attrib[i]] = true;
      }

      nodesToHydrate.push(node);
    });
  }

  var _insert;
  /*: (
  selector: string,
  serialized: SerializedStyles,
  sheet: StyleSheet,
  shouldCache: boolean
  ) => string | void */


  var omnipresentPlugins = [compat, removeLabel];

  {
    omnipresentPlugins.push(createUnsafeSelectorsAlarm({
      get compat() {
        return cache.compat;
      }

    }), incorrectImportAlarm);
  }

  {
    var currentSheet;
    var finalizingPlugins = [stylis__WEBPACK_IMPORTED_MODULE_6__.stringify, function (element) {
      if (!element.root) {
        if (element["return"]) {
          currentSheet.insert(element["return"]);
        } else if (element.value && element.type !== stylis__WEBPACK_IMPORTED_MODULE_5__.COMMENT) {
          // insert empty rule in non-production environments
          // so @emotion/jest can grab `key` from the (JS)DOM for caches without any rules inserted yet
          currentSheet.insert(element.value + "{}");
        }
      }
    } ];
    var serializer = (0,stylis__WEBPACK_IMPORTED_MODULE_7__.middleware)(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));

    var stylis = function stylis(styles) {
      return (0,stylis__WEBPACK_IMPORTED_MODULE_6__.serialize)((0,stylis__WEBPACK_IMPORTED_MODULE_8__.compile)(styles), serializer);
    };

    _insert = function
      /*: void */
    insert(selector
    /*: string */
    , serialized
    /*: SerializedStyles */
    , sheet
    /*: StyleSheet */
    , shouldCache
    /*: boolean */
    ) {
      currentSheet = sheet;

      if (serialized.map !== undefined) {
        currentSheet = {
          insert: function insert(rule
          /*: string */
          ) {
            sheet.insert(rule + serialized.map);
          }
        };
      }

      stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);

      if (shouldCache) {
        cache.inserted[serialized.name] = true;
      }
    };
  }

  var cache
  /*: EmotionCache */
  = {
    key: key,
    sheet: new _emotion_sheet__WEBPACK_IMPORTED_MODULE_0__.StyleSheet({
      key: key,
      container: container,
      nonce: options.nonce,
      speedy: options.speedy,
      prepend: options.prepend,
      insertionPoint: options.insertionPoint
    }),
    nonce: options.nonce,
    inserted: inserted,
    registered: {},
    insert: _insert
  };
  cache.sheet.hydrate(nodesToHydrate);
  return cache;
};




/***/ }),

/***/ "./node_modules/@emotion/css/create-instance/dist/emotion-css-create-instance.development.esm.js":
/*!*******************************************************************************************************!*\
  !*** ./node_modules/@emotion/css/create-instance/dist/emotion-css-create-instance.development.esm.js ***!
  \*******************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createEmotion)
/* harmony export */ });
/* harmony import */ var _emotion_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/cache */ "./node_modules/@emotion/cache/dist/emotion-cache.browser.development.esm.js");
/* harmony import */ var _emotion_serialize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/serialize */ "./node_modules/@emotion/serialize/dist/emotion-serialize.development.esm.js");
/* harmony import */ var _emotion_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @emotion/utils */ "./node_modules/@emotion/utils/dist/emotion-utils.browser.esm.js");




function insertWithoutScoping(cache, serialized) {
  if (cache.inserted[serialized.name] === undefined) {
    return cache.insert('', serialized, cache.sheet, true);
  }
}

function merge(registered, css, className) {
  var registeredStyles = [];
  var rawClassName = (0,_emotion_utils__WEBPACK_IMPORTED_MODULE_2__.getRegisteredStyles)(registered, registeredStyles, className);

  if (registeredStyles.length < 2) {
    return className;
  }

  return rawClassName + css(registeredStyles);
}

var createEmotion = function createEmotion(options) {
  var cache = (0,_emotion_cache__WEBPACK_IMPORTED_MODULE_0__.default)(options);

  cache.sheet.speedy = function (value) {
    if (this.ctr !== 0) {
      throw new Error('speedy must be changed before any rules are inserted');
    }

    this.isSpeedy = value;
  };

  cache.compat = true;

  var css = function css() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var serialized = (0,_emotion_serialize__WEBPACK_IMPORTED_MODULE_1__.serializeStyles)(args, cache.registered, undefined);
    (0,_emotion_utils__WEBPACK_IMPORTED_MODULE_2__.insertStyles)(cache, serialized, false);
    return cache.key + "-" + serialized.name;
  };

  var keyframes = function keyframes() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var serialized = (0,_emotion_serialize__WEBPACK_IMPORTED_MODULE_1__.serializeStyles)(args, cache.registered);
    var animation = "animation-" + serialized.name;
    insertWithoutScoping(cache, {
      name: serialized.name,
      styles: "@keyframes " + animation + "{" + serialized.styles + "}"
    });
    return animation;
  };

  var injectGlobal = function injectGlobal() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var serialized = (0,_emotion_serialize__WEBPACK_IMPORTED_MODULE_1__.serializeStyles)(args, cache.registered);
    insertWithoutScoping(cache, serialized);
  };

  var cx = function cx() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return merge(cache.registered, css, classnames(args));
  };

  return {
    css: css,
    cx: cx,
    injectGlobal: injectGlobal,
    keyframes: keyframes,
    hydrate: function hydrate(ids) {
      ids.forEach(function (key) {
        cache.inserted[key] = true;
      });
    },
    flush: function flush() {
      cache.registered = {};
      cache.inserted = {};
      cache.sheet.flush();
    },
    sheet: cache.sheet,
    cache: cache,
    getRegisteredStyles: _emotion_utils__WEBPACK_IMPORTED_MODULE_2__.getRegisteredStyles.bind(null, cache.registered),
    merge: merge.bind(null, cache.registered, css)
  };
};

var classnames = function classnames(args) {
  var cls = '';

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg == null) continue;
    var toAdd = void 0;

    switch (typeof arg) {
      case 'boolean':
        break;

      case 'object':
        {
          if (Array.isArray(arg)) {
            toAdd = classnames(arg);
          } else {
            toAdd = '';

            for (var k in arg) {
              if (arg[k] && k) {
                toAdd && (toAdd += ' ');
                toAdd += k;
              }
            }
          }

          break;
        }

      default:
        {
          toAdd = arg;
        }
    }

    if (toAdd) {
      cls && (cls += ' ');
      cls += toAdd;
    }
  }

  return cls;
};




/***/ }),

/***/ "./node_modules/@emotion/css/dist/emotion-css.development.esm.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@emotion/css/dist/emotion-css.development.esm.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "cache": () => (/* binding */ cache),
/* harmony export */   "css": () => (/* binding */ css),
/* harmony export */   "cx": () => (/* binding */ cx),
/* harmony export */   "flush": () => (/* binding */ flush),
/* harmony export */   "getRegisteredStyles": () => (/* binding */ getRegisteredStyles),
/* harmony export */   "hydrate": () => (/* binding */ hydrate),
/* harmony export */   "injectGlobal": () => (/* binding */ injectGlobal),
/* harmony export */   "keyframes": () => (/* binding */ keyframes),
/* harmony export */   "merge": () => (/* binding */ merge),
/* harmony export */   "sheet": () => (/* binding */ sheet)
/* harmony export */ });
/* harmony import */ var _create_instance_dist_emotion_css_create_instance_development_esm_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../create-instance/dist/emotion-css-create-instance.development.esm.js */ "./node_modules/@emotion/css/create-instance/dist/emotion-css-create-instance.development.esm.js");
/* harmony import */ var _emotion_cache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/cache */ "./node_modules/@emotion/cache/dist/emotion-cache.browser.development.esm.js");
/* harmony import */ var _emotion_serialize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @emotion/serialize */ "./node_modules/@emotion/serialize/dist/emotion-serialize.development.esm.js");
/* harmony import */ var _emotion_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @emotion/utils */ "./node_modules/@emotion/utils/dist/emotion-utils.browser.esm.js");





var _createEmotion = (0,_create_instance_dist_emotion_css_create_instance_development_esm_js__WEBPACK_IMPORTED_MODULE_0__.default)({
  key: 'css'
}),
    flush = _createEmotion.flush,
    hydrate = _createEmotion.hydrate,
    cx = _createEmotion.cx,
    merge = _createEmotion.merge,
    getRegisteredStyles = _createEmotion.getRegisteredStyles,
    injectGlobal = _createEmotion.injectGlobal,
    keyframes = _createEmotion.keyframes,
    css = _createEmotion.css,
    sheet = _createEmotion.sheet,
    cache = _createEmotion.cache;




/***/ }),

/***/ "./node_modules/@emotion/hash/dist/emotion-hash.esm.js":
/*!*************************************************************!*\
  !*** ./node_modules/@emotion/hash/dist/emotion-hash.esm.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ murmur2)
/* harmony export */ });
/* eslint-disable */
// Inspired by https://github.com/garycourt/murmurhash-js
// Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
function murmur2(str) {
  // 'm' and 'r' are mixing constants generated offline.
  // They're not really 'magic', they just happen to work well.
  // const m = 0x5bd1e995;
  // const r = 24;
  // Initialize the hash
  var h = 0; // Mix 4 bytes at a time into the hash

  var k,
      i = 0,
      len = str.length;

  for (; len >= 4; ++i, len -= 4) {
    k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
    k =
    /* Math.imul(k, m): */
    (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16);
    k ^=
    /* k >>> r: */
    k >>> 24;
    h =
    /* Math.imul(k, m): */
    (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16) ^
    /* Math.imul(h, m): */
    (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  } // Handle the last few bytes of the input array


  switch (len) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h =
      /* Math.imul(h, m): */
      (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  } // Do a few final mixes of the hash to ensure the last few
  // bytes are well-incorporated.


  h ^= h >>> 13;
  h =
  /* Math.imul(h, m): */
  (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
  return ((h ^ h >>> 15) >>> 0).toString(36);
}




/***/ }),

/***/ "./node_modules/@emotion/memoize/dist/emotion-memoize.esm.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@emotion/memoize/dist/emotion-memoize.esm.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ memoize)
/* harmony export */ });
function memoize(fn) {
  var cache = Object.create(null);
  return function (arg) {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}




/***/ }),

/***/ "./node_modules/@emotion/serialize/dist/emotion-serialize.development.esm.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/@emotion/serialize/dist/emotion-serialize.development.esm.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "serializeStyles": () => (/* binding */ serializeStyles)
/* harmony export */ });
/* harmony import */ var _emotion_hash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/hash */ "./node_modules/@emotion/hash/dist/emotion-hash.esm.js");
/* harmony import */ var _emotion_unitless__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/unitless */ "./node_modules/@emotion/unitless/dist/emotion-unitless.esm.js");
/* harmony import */ var _emotion_memoize__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @emotion/memoize */ "./node_modules/@emotion/memoize/dist/emotion-memoize.esm.js");




var isDevelopment = true;

var ILLEGAL_ESCAPE_SEQUENCE_ERROR = "You have illegal escape sequence in your template literal, most likely inside content's property value.\nBecause you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \"content: '\\00d7';\" should become \"content: '\\\\00d7';\".\nYou can read more about this here:\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences";
var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
var hyphenateRegex = /[A-Z]|^ms/g;
var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;

var isCustomProperty = function isCustomProperty(property) {
  return property.charCodeAt(1) === 45;
};

var isProcessableValue = function isProcessableValue(value) {
  return value != null && typeof value !== 'boolean';
};

var processStyleName = /* #__PURE__ */(0,_emotion_memoize__WEBPACK_IMPORTED_MODULE_2__.default)(function (styleName) {
  return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
});

var processStyleValue = function processStyleValue(key, value) {
  switch (key) {
    case 'animation':
    case 'animationName':
      {
        if (typeof value === 'string') {
          return value.replace(animationRegex, function (match, p1, p2) {
            cursor = {
              name: p1,
              styles: p2,
              next: cursor
            };
            return p1;
          });
        }
      }
  }

  if (_emotion_unitless__WEBPACK_IMPORTED_MODULE_1__.default[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) {
    return value + 'px';
  }

  return value;
};

{
  var contentValuePattern = /(var|attr|counters?|url|element|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
  var contentValues = ['normal', 'none', 'initial', 'inherit', 'unset'];
  var oldProcessStyleValue = processStyleValue;
  var msPattern = /^-ms-/;
  var hyphenPattern = /-(.)/g;
  var hyphenatedCache = {};

  processStyleValue = function processStyleValue(key, value) {
    if (key === 'content') {
      if (typeof value !== 'string' || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
        throw new Error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
      }
    }

    var processed = oldProcessStyleValue(key, value);

    if (processed !== '' && !isCustomProperty(key) && key.indexOf('-') !== -1 && hyphenatedCache[key] === undefined) {
      hyphenatedCache[key] = true;
      console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, 'ms-').replace(hyphenPattern, function (str, _char) {
        return _char.toUpperCase();
      }) + "?");
    }

    return processed;
  };
}

var noComponentSelectorMessage = 'Component selectors can only be used in conjunction with ' + '@emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware ' + 'compiler transform.';

function handleInterpolation(mergedProps, registered, interpolation) {
  if (interpolation == null) {
    return '';
  }

  var componentSelector = interpolation;

  if (componentSelector.__emotion_styles !== undefined) {
    if (String(componentSelector) === 'NO_COMPONENT_SELECTOR') {
      throw new Error(noComponentSelectorMessage);
    }

    return componentSelector;
  }

  switch (typeof interpolation) {
    case 'boolean':
      {
        return '';
      }

    case 'object':
      {
        var keyframes = interpolation;

        if (keyframes.anim === 1) {
          cursor = {
            name: keyframes.name,
            styles: keyframes.styles,
            next: cursor
          };
          return keyframes.name;
        }

        var serializedStyles = interpolation;

        if (serializedStyles.styles !== undefined) {
          var next = serializedStyles.next;

          if (next !== undefined) {
            // not the most efficient thing ever but this is a pretty rare case
            // and there will be very few iterations of this generally
            while (next !== undefined) {
              cursor = {
                name: next.name,
                styles: next.styles,
                next: cursor
              };
              next = next.next;
            }
          }

          var styles = serializedStyles.styles + ";";

          if (serializedStyles.map !== undefined) {
            styles += serializedStyles.map;
          }

          return styles;
        }

        return createStringFromObject(mergedProps, registered, interpolation);
      }

    case 'function':
      {
        if (mergedProps !== undefined) {
          var previousCursor = cursor;
          var result = interpolation(mergedProps);
          cursor = previousCursor;
          return handleInterpolation(mergedProps, registered, result);
        } else {
          console.error('Functions that are interpolated in css calls will be stringified.\n' + 'If you want to have a css call based on props, create a function that returns a css call like this\n' + 'let dynamicStyle = (props) => css`color: ${props.color}`\n' + 'It can be called directly with props or interpolated in a styled call like this\n' + "let SomeComponent = styled('div')`${dynamicStyle}`");
        }

        break;
      }

    case 'string':
      {
        var matched = [];
        var replaced = interpolation.replace(animationRegex, function (_match, _p1, p2) {
          var fakeVarName = "animation" + matched.length;
          matched.push("const " + fakeVarName + " = keyframes`" + p2.replace(/^@keyframes animation-\w+/, '') + "`");
          return "${" + fakeVarName + "}";
        });

        if (matched.length) {
          console.error("`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\nInstead of doing this:\n\n" + [].concat(matched, ["`" + replaced + "`"]).join('\n') + "\n\nYou should wrap it with `css` like this:\n\ncss`" + replaced + "`");
        }
      }

      break;
  } // finalize string values (regular strings and functions interpolated into css calls)


  var asString = interpolation;

  if (registered == null) {
    return asString;
  }

  var cached = registered[asString];
  return cached !== undefined ? cached : asString;
}

function createStringFromObject(mergedProps, registered, obj) {
  var string = '';

  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
    }
  } else {
    for (var key in obj) {
      var value = obj[key];

      if (typeof value !== 'object') {
        var asString = value;

        if (registered != null && registered[asString] !== undefined) {
          string += key + "{" + registered[asString] + "}";
        } else if (isProcessableValue(asString)) {
          string += processStyleName(key) + ":" + processStyleValue(key, asString) + ";";
        }
      } else {
        if (key === 'NO_COMPONENT_SELECTOR' && isDevelopment) {
          throw new Error(noComponentSelectorMessage);
        }

        if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
          for (var _i = 0; _i < value.length; _i++) {
            if (isProcessableValue(value[_i])) {
              string += processStyleName(key) + ":" + processStyleValue(key, value[_i]) + ";";
            }
          }
        } else {
          var interpolated = handleInterpolation(mergedProps, registered, value);

          switch (key) {
            case 'animation':
            case 'animationName':
              {
                string += processStyleName(key) + ":" + interpolated + ";";
                break;
              }

            default:
              {
                if (key === 'undefined') {
                  console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
                }

                string += key + "{" + interpolated + "}";
              }
          }
        }
      }
    }
  }

  return string;
}

var labelPattern = /label:\s*([^\s;{]+)\s*(;|$)/g;
var sourceMapPattern;

{
  sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g;
} // this is the cursor for keyframes
// keyframes are stored on the SerializedStyles object as a linked list


var cursor;
function serializeStyles(args, registered, mergedProps) {
  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) {
    return args[0];
  }

  var stringMode = true;
  var styles = '';
  cursor = undefined;
  var strings = args[0];

  if (strings == null || strings.raw === undefined) {
    stringMode = false;
    styles += handleInterpolation(mergedProps, registered, strings);
  } else {
    var asTemplateStringsArr = strings;

    if (asTemplateStringsArr[0] === undefined) {
      console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
    }

    styles += asTemplateStringsArr[0];
  } // we start at 1 since we've already handled the first arg


  for (var i = 1; i < args.length; i++) {
    styles += handleInterpolation(mergedProps, registered, args[i]);

    if (stringMode) {
      var templateStringsArr = strings;

      if (templateStringsArr[i] === undefined) {
        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
      }

      styles += templateStringsArr[i];
    }
  }

  var sourceMap;

  {
    styles = styles.replace(sourceMapPattern, function (match) {
      sourceMap = match;
      return '';
    });
  } // using a global regex with .exec is stateful so lastIndex has to be reset each time


  labelPattern.lastIndex = 0;
  var identifierName = '';
  var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5

  while ((match = labelPattern.exec(styles)) !== null) {
    identifierName += '-' + match[1];
  }

  var name = (0,_emotion_hash__WEBPACK_IMPORTED_MODULE_0__.default)(styles) + identifierName;

  {
    var devStyles = {
      name: name,
      styles: styles,
      map: sourceMap,
      next: cursor,
      toString: function toString() {
        return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
      }
    };
    return devStyles;
  }
}




/***/ }),

/***/ "./node_modules/@emotion/sheet/dist/emotion-sheet.development.esm.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@emotion/sheet/dist/emotion-sheet.development.esm.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "StyleSheet": () => (/* binding */ StyleSheet)
/* harmony export */ });
var isDevelopment = true;

/*

Based off glamor's StyleSheet, thanks Sunil ❤️

high performance StyleSheet for css-in-js systems

- uses multiple style tags behind the scenes for millions of rules
- uses `insertRule` for appending in production for *much* faster performance

// usage

import { StyleSheet } from '@emotion/sheet'

let styleSheet = new StyleSheet({ key: '', container: document.head })

styleSheet.insert('#box { border: 1px solid red; }')
- appends a css rule into the stylesheet

styleSheet.flush()
- empties the stylesheet of all its contents

*/

function sheetForTag(tag) {
  if (tag.sheet) {
    return tag.sheet;
  } // this weirdness brought to you by firefox

  /* istanbul ignore next */


  for (var i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode === tag) {
      return document.styleSheets[i];
    }
  } // this function should always return with a value
  // TS can't understand it though so we make it stop complaining here


  return undefined;
}

function createStyleElement(options) {
  var tag = document.createElement('style');
  tag.setAttribute('data-emotion', options.key);

  if (options.nonce !== undefined) {
    tag.setAttribute('nonce', options.nonce);
  }

  tag.appendChild(document.createTextNode(''));
  tag.setAttribute('data-s', '');
  return tag;
}

var StyleSheet = /*#__PURE__*/function () {
  // Using Node instead of HTMLElement since container may be a ShadowRoot
  function StyleSheet(options) {
    var _this = this;

    this._insertTag = function (tag) {
      var before;

      if (_this.tags.length === 0) {
        if (_this.insertionPoint) {
          before = _this.insertionPoint.nextSibling;
        } else if (_this.prepend) {
          before = _this.container.firstChild;
        } else {
          before = _this.before;
        }
      } else {
        before = _this.tags[_this.tags.length - 1].nextSibling;
      }

      _this.container.insertBefore(tag, before);

      _this.tags.push(tag);
    };

    this.isSpeedy = options.speedy === undefined ? !isDevelopment : options.speedy;
    this.tags = [];
    this.ctr = 0;
    this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets

    this.key = options.key;
    this.container = options.container;
    this.prepend = options.prepend;
    this.insertionPoint = options.insertionPoint;
    this.before = null;
  }

  var _proto = StyleSheet.prototype;

  _proto.hydrate = function hydrate(nodes) {
    nodes.forEach(this._insertTag);
  };

  _proto.insert = function insert(rule) {
    // the max length is how many rules we have per style tag, it's 65000 in speedy mode
    // it's 1 in dev because we insert source maps that map a single rule to a location
    // and you can only have one source map per style tag
    if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) {
      this._insertTag(createStyleElement(this));
    }

    var tag = this.tags[this.tags.length - 1];

    {
      var isImportRule = rule.charCodeAt(0) === 64 && rule.charCodeAt(1) === 105;

      if (isImportRule && this._alreadyInsertedOrderInsensitiveRule) {
        // this would only cause problem in speedy mode
        // but we don't want enabling speedy to affect the observable behavior
        // so we report this error at all times
        console.error("You're attempting to insert the following rule:\n" + rule + '\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules.');
      }

      this._alreadyInsertedOrderInsensitiveRule = this._alreadyInsertedOrderInsensitiveRule || !isImportRule;
    }

    if (this.isSpeedy) {
      var sheet = sheetForTag(tag);

      try {
        // this is the ultrafast version, works across browsers
        // the big drawback is that the css won't be editable in devtools
        sheet.insertRule(rule, sheet.cssRules.length);
      } catch (e) {
        if (!/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear|-ms-expand|-ms-reveal){/.test(rule)) {
          console.error("There was a problem inserting the following rule: \"" + rule + "\"", e);
        }
      }
    } else {
      tag.appendChild(document.createTextNode(rule));
    }

    this.ctr++;
  };

  _proto.flush = function flush() {
    this.tags.forEach(function (tag) {
      var _tag$parentNode;

      return (_tag$parentNode = tag.parentNode) == null ? void 0 : _tag$parentNode.removeChild(tag);
    });
    this.tags = [];
    this.ctr = 0;

    {
      this._alreadyInsertedOrderInsensitiveRule = false;
    }
  };

  return StyleSheet;
}();




/***/ }),

/***/ "./node_modules/@emotion/unitless/dist/emotion-unitless.esm.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@emotion/unitless/dist/emotion-unitless.esm.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ unitlessKeys)
/* harmony export */ });
var unitlessKeys = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  scale: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};




/***/ }),

/***/ "./node_modules/@emotion/utils/dist/emotion-utils.browser.esm.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@emotion/utils/dist/emotion-utils.browser.esm.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getRegisteredStyles": () => (/* binding */ getRegisteredStyles),
/* harmony export */   "insertStyles": () => (/* binding */ insertStyles),
/* harmony export */   "registerStyles": () => (/* binding */ registerStyles)
/* harmony export */ });
var isBrowser = true;

function getRegisteredStyles(registered, registeredStyles, classNames) {
  var rawClassName = '';
  classNames.split(' ').forEach(function (className) {
    if (registered[className] !== undefined) {
      registeredStyles.push(registered[className] + ";");
    } else if (className) {
      rawClassName += className + " ";
    }
  });
  return rawClassName;
}
var registerStyles = function registerStyles(cache, serialized, isStringTag) {
  var className = cache.key + "-" + serialized.name;

  if ( // we only need to add the styles to the registered cache if the
  // class name could be used further down
  // the tree but if it's a string tag, we know it won't
  // so we don't have to add it to registered cache.
  // this improves memory usage since we can avoid storing the whole style string
  (isStringTag === false || // we need to always store it if we're in compat mode and
  // in node since emotion-server relies on whether a style is in
  // the registered cache to know whether a style is global or not
  // also, note that this check will be dead code eliminated in the browser
  isBrowser === false ) && cache.registered[className] === undefined) {
    cache.registered[className] = serialized.styles;
  }
};
var insertStyles = function insertStyles(cache, serialized, isStringTag) {
  registerStyles(cache, serialized, isStringTag);
  var className = cache.key + "-" + serialized.name;

  if (cache.inserted[serialized.name] === undefined) {
    var current = serialized;

    do {
      cache.insert(serialized === current ? "." + className : '', current, cache.sheet, true);

      current = current.next;
    } while (current !== undefined);
  }
};




/***/ }),

/***/ "./node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@emotion/weak-memoize/dist/emotion-weak-memoize.esm.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ weakMemoize)
/* harmony export */ });
var weakMemoize = function weakMemoize(func) {
  var cache = new WeakMap();
  return function (arg) {
    if (cache.has(arg)) {
      // Use non-null assertion because we just checked that the cache `has` it
      // This allows us to remove `undefined` from the return value
      return cache.get(arg);
    }

    var ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
};




/***/ }),

/***/ "./node_modules/stylis/src/Enum.js":
/*!*****************************************!*\
  !*** ./node_modules/stylis/src/Enum.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MS": () => (/* binding */ MS),
/* harmony export */   "MOZ": () => (/* binding */ MOZ),
/* harmony export */   "WEBKIT": () => (/* binding */ WEBKIT),
/* harmony export */   "COMMENT": () => (/* binding */ COMMENT),
/* harmony export */   "RULESET": () => (/* binding */ RULESET),
/* harmony export */   "DECLARATION": () => (/* binding */ DECLARATION),
/* harmony export */   "PAGE": () => (/* binding */ PAGE),
/* harmony export */   "MEDIA": () => (/* binding */ MEDIA),
/* harmony export */   "IMPORT": () => (/* binding */ IMPORT),
/* harmony export */   "CHARSET": () => (/* binding */ CHARSET),
/* harmony export */   "VIEWPORT": () => (/* binding */ VIEWPORT),
/* harmony export */   "SUPPORTS": () => (/* binding */ SUPPORTS),
/* harmony export */   "DOCUMENT": () => (/* binding */ DOCUMENT),
/* harmony export */   "NAMESPACE": () => (/* binding */ NAMESPACE),
/* harmony export */   "KEYFRAMES": () => (/* binding */ KEYFRAMES),
/* harmony export */   "FONT_FACE": () => (/* binding */ FONT_FACE),
/* harmony export */   "COUNTER_STYLE": () => (/* binding */ COUNTER_STYLE),
/* harmony export */   "FONT_FEATURE_VALUES": () => (/* binding */ FONT_FEATURE_VALUES),
/* harmony export */   "LAYER": () => (/* binding */ LAYER)
/* harmony export */ });
var MS = '-ms-'
var MOZ = '-moz-'
var WEBKIT = '-webkit-'

var COMMENT = 'comm'
var RULESET = 'rule'
var DECLARATION = 'decl'

var PAGE = '@page'
var MEDIA = '@media'
var IMPORT = '@import'
var CHARSET = '@charset'
var VIEWPORT = '@viewport'
var SUPPORTS = '@supports'
var DOCUMENT = '@document'
var NAMESPACE = '@namespace'
var KEYFRAMES = '@keyframes'
var FONT_FACE = '@font-face'
var COUNTER_STYLE = '@counter-style'
var FONT_FEATURE_VALUES = '@font-feature-values'
var LAYER = '@layer'


/***/ }),

/***/ "./node_modules/stylis/src/Middleware.js":
/*!***********************************************!*\
  !*** ./node_modules/stylis/src/Middleware.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "middleware": () => (/* binding */ middleware),
/* harmony export */   "rulesheet": () => (/* binding */ rulesheet),
/* harmony export */   "prefixer": () => (/* binding */ prefixer),
/* harmony export */   "namespace": () => (/* binding */ namespace)
/* harmony export */ });
/* harmony import */ var _Enum_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Enum.js */ "./node_modules/stylis/src/Enum.js");
/* harmony import */ var _Utility_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utility.js */ "./node_modules/stylis/src/Utility.js");
/* harmony import */ var _Tokenizer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Tokenizer.js */ "./node_modules/stylis/src/Tokenizer.js");
/* harmony import */ var _Serializer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Serializer.js */ "./node_modules/stylis/src/Serializer.js");
/* harmony import */ var _Prefixer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Prefixer.js */ "./node_modules/stylis/src/Prefixer.js");






/**
 * @param {function[]} collection
 * @return {function}
 */
function middleware (collection) {
	var length = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.sizeof)(collection)

	return function (element, index, children, callback) {
		var output = ''

		for (var i = 0; i < length; i++)
			output += collection[i](element, index, children, callback) || ''

		return output
	}
}

/**
 * @param {function} callback
 * @return {function}
 */
function rulesheet (callback) {
	return function (element) {
		if (!element.root)
			if (element = element.return)
				callback(element)
	}
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 */
function prefixer (element, index, children, callback) {
	if (element.length > -1)
		if (!element.return)
			switch (element.type) {
				case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.DECLARATION: element.return = (0,_Prefixer_js__WEBPACK_IMPORTED_MODULE_2__.prefix)(element.value, element.length, children)
					return
				case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.KEYFRAMES:
					return (0,_Serializer_js__WEBPACK_IMPORTED_MODULE_3__.serialize)([(0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_4__.copy)(element, {value: (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(element.value, '@', '@' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT)})], callback)
				case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.RULESET:
					if (element.length)
						return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.combine)(element.props, function (value) {
							switch ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(value, /(::plac\w+|:read-\w+)/)) {
								// :read-(only|write)
								case ':read-only': case ':read-write':
									return (0,_Serializer_js__WEBPACK_IMPORTED_MODULE_3__.serialize)([(0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_4__.copy)(element, {props: [(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /:(read-\w+)/, ':' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MOZ + '$1')]})], callback)
								// :placeholder
								case '::placeholder':
									return (0,_Serializer_js__WEBPACK_IMPORTED_MODULE_3__.serialize)([
										(0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_4__.copy)(element, {props: [(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /:(plac\w+)/, ':' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + 'input-$1')]}),
										(0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_4__.copy)(element, {props: [(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /:(plac\w+)/, ':' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MOZ + '$1')]}),
										(0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_4__.copy)(element, {props: [(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /:(plac\w+)/, _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'input-$1')]})
									], callback)
							}

							return ''
						})
			}
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 */
function namespace (element) {
	switch (element.type) {
		case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.RULESET:
			element.props = element.props.map(function (value) {
				return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.combine)((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_4__.tokenize)(value), function (value, index, children) {
					switch ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, 0)) {
						// \f
						case 12:
							return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.substr)(value, 1, (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.strlen)(value))
						// \0 ( + > ~
						case 0: case 40: case 43: case 62: case 126:
							return value
						// :
						case 58:
							if (children[++index] === 'global')
								children[index] = '', children[++index] = '\f' + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.substr)(children[index], index = 1, -1)
						// \s
						case 32:
							return index === 1 ? '' : value
						default:
							switch (index) {
								case 0: element = value
									return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.sizeof)(children) > 1 ? '' : value
								case index = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.sizeof)(children) - 1: case 2:
									return index === 2 ? value + element + element : value + element
								default:
									return value
							}
					}
				})
			})
	}
}


/***/ }),

/***/ "./node_modules/stylis/src/Parser.js":
/*!*******************************************!*\
  !*** ./node_modules/stylis/src/Parser.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "compile": () => (/* binding */ compile),
/* harmony export */   "parse": () => (/* binding */ parse),
/* harmony export */   "ruleset": () => (/* binding */ ruleset),
/* harmony export */   "comment": () => (/* binding */ comment),
/* harmony export */   "declaration": () => (/* binding */ declaration)
/* harmony export */ });
/* harmony import */ var _Enum_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Enum.js */ "./node_modules/stylis/src/Enum.js");
/* harmony import */ var _Utility_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Utility.js */ "./node_modules/stylis/src/Utility.js");
/* harmony import */ var _Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Tokenizer.js */ "./node_modules/stylis/src/Tokenizer.js");




/**
 * @param {string} value
 * @return {object[]}
 */
function compile (value) {
	return (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.dealloc)(parse('', null, null, null, [''], value = (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.alloc)(value), 0, [0], value))
}

/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {string[]} rule
 * @param {string[]} rules
 * @param {string[]} rulesets
 * @param {number[]} pseudo
 * @param {number[]} points
 * @param {string[]} declarations
 * @return {object}
 */
function parse (value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
	var index = 0
	var offset = 0
	var length = pseudo
	var atrule = 0
	var property = 0
	var previous = 0
	var variable = 1
	var scanning = 1
	var ampersand = 1
	var character = 0
	var type = ''
	var props = rules
	var children = rulesets
	var reference = rule
	var characters = type

	while (scanning)
		switch (previous = character, character = (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.next)()) {
			// (
			case 40:
				if (previous != 108 && (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.charat)(characters, length - 1) == 58) {
					if ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.indexof)(characters += (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.replace)((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.delimit)(character), '&', '&\f'), '&\f') != -1)
						ampersand = -1
					break
				}
			// " ' [
			case 34: case 39: case 91:
				characters += (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.delimit)(character)
				break
			// \t \n \r \s
			case 9: case 10: case 13: case 32:
				characters += (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.whitespace)(previous)
				break
			// \
			case 92:
				characters += (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.escaping)((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.caret)() - 1, 7)
				continue
			// /
			case 47:
				switch ((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.peek)()) {
					case 42: case 47:
						;(0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.append)(comment((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.commenter)((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.next)(), (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.caret)()), root, parent), declarations)
						break
					default:
						characters += '/'
				}
				break
			// {
			case 123 * variable:
				points[index++] = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.strlen)(characters) * ampersand
			// } ; \0
			case 125 * variable: case 59: case 0:
				switch (character) {
					// \0 }
					case 0: case 125: scanning = 0
					// ;
					case 59 + offset: if (ampersand == -1) characters = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.replace)(characters, /\f/g, '')
						if (property > 0 && ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.strlen)(characters) - length))
							(0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.append)(property > 32 ? declaration(characters + ';', rule, parent, length - 1) : declaration((0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.replace)(characters, ' ', '') + ';', rule, parent, length - 2), declarations)
						break
					// @ ;
					case 59: characters += ';'
					// { rule/at-rule
					default:
						;(0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.append)(reference = ruleset(characters, root, parent, index, offset, rules, points, type, props = [], children = [], length), rulesets)

						if (character === 123)
							if (offset === 0)
								parse(characters, root, reference, reference, props, rulesets, length, points, children)
							else
								switch (atrule === 99 && (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.charat)(characters, 3) === 110 ? 100 : atrule) {
									// d l m s
									case 100: case 108: case 109: case 115:
										parse(value, reference, reference, rule && (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.append)(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length), children), rules, children, length, points, rule ? props : children)
										break
									default:
										parse(characters, reference, reference, reference, [''], children, 0, points, children)
								}
				}

				index = offset = property = 0, variable = ampersand = 1, type = characters = '', length = pseudo
				break
			// :
			case 58:
				length = 1 + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.strlen)(characters), property = previous
			default:
				if (variable < 1)
					if (character == 123)
						--variable
					else if (character == 125 && variable++ == 0 && (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.prev)() == 125)
						continue

				switch (characters += (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.from)(character), character * variable) {
					// &
					case 38:
						ampersand = offset > 0 ? 1 : (characters += '\f', -1)
						break
					// ,
					case 44:
						points[index++] = ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.strlen)(characters) - 1) * ampersand, ampersand = 1
						break
					// @
					case 64:
						// -
						if ((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.peek)() === 45)
							characters += (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.delimit)((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.next)())

						atrule = (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.peek)(), offset = length = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.strlen)(type = characters += (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.identifier)((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.caret)())), character++
						break
					// -
					case 45:
						if (previous === 45 && (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.strlen)(characters) == 2)
							variable = 0
				}
		}

	return rulesets
}

/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {number} index
 * @param {number} offset
 * @param {string[]} rules
 * @param {number[]} points
 * @param {string} type
 * @param {string[]} props
 * @param {string[]} children
 * @param {number} length
 * @return {object}
 */
function ruleset (value, root, parent, index, offset, rules, points, type, props, children, length) {
	var post = offset - 1
	var rule = offset === 0 ? rules : ['']
	var size = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.sizeof)(rule)

	for (var i = 0, j = 0, k = 0; i < index; ++i)
		for (var x = 0, y = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.substr)(value, post + 1, post = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.abs)(j = points[i])), z = value; x < size; ++x)
			if (z = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.trim)(j > 0 ? rule[x] + ' ' + y : (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.replace)(y, /&\f/g, rule[x])))
				props[k++] = z

	return (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.node)(value, root, parent, offset === 0 ? _Enum_js__WEBPACK_IMPORTED_MODULE_2__.RULESET : type, props, children, length)
}

/**
 * @param {number} value
 * @param {object} root
 * @param {object?} parent
 * @return {object}
 */
function comment (value, root, parent) {
	return (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.node)(value, root, parent, _Enum_js__WEBPACK_IMPORTED_MODULE_2__.COMMENT, (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.from)((0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.char)()), (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.substr)(value, 2, -2), 0)
}

/**
 * @param {string} value
 * @param {object} root
 * @param {object?} parent
 * @param {number} length
 * @return {object}
 */
function declaration (value, root, parent, length) {
	return (0,_Tokenizer_js__WEBPACK_IMPORTED_MODULE_0__.node)(value, root, parent, _Enum_js__WEBPACK_IMPORTED_MODULE_2__.DECLARATION, (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.substr)(value, 0, length), (0,_Utility_js__WEBPACK_IMPORTED_MODULE_1__.substr)(value, length + 1, -1), length)
}


/***/ }),

/***/ "./node_modules/stylis/src/Prefixer.js":
/*!*********************************************!*\
  !*** ./node_modules/stylis/src/Prefixer.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "prefix": () => (/* binding */ prefix)
/* harmony export */ });
/* harmony import */ var _Enum_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Enum.js */ "./node_modules/stylis/src/Enum.js");
/* harmony import */ var _Utility_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utility.js */ "./node_modules/stylis/src/Utility.js");



/**
 * @param {string} value
 * @param {number} length
 * @param {object[]} children
 * @return {string}
 */
function prefix (value, length, children) {
	switch ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.hash)(value, length)) {
		// color-adjust
		case 5103:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + 'print-' + value + value
		// animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
		case 5737: case 4201: case 3177: case 3433: case 1641: case 4457: case 2921:
		// text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
		case 5572: case 6356: case 5844: case 3191: case 6645: case 3005:
		// mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
		case 6391: case 5879: case 5623: case 6135: case 4599: case 4855:
		// background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
		case 4215: case 6389: case 5109: case 5365: case 5621: case 3829:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + value
		// tab-size
		case 4789:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MOZ + value + value
		// appearance, user-select, transform, hyphens, text-size-adjust
		case 5349: case 4246: case 4810: case 6968: case 2756:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MOZ + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + value + value
		// writing-mode
		case 5936:
			switch ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, length + 11)) {
				// vertical-l(r)
				case 114:
					return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /[svh]\w+-[tblr]{2}/, 'tb') + value
				// vertical-r(l)
				case 108:
					return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value
				// horizontal(-)tb
				case 45:
					return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /[svh]\w+-[tblr]{2}/, 'lr') + value
				// default: fallthrough to below
			}
		// flex, flex-direction, scroll-snap-type, writing-mode
		case 6828: case 4268: case 2903:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + value + value
		// order
		case 6165:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'flex-' + value + value
		// align-items
		case 5187:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(\w+).+(:[^]+)/, _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + 'box-$1$2' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'flex-$1$2') + value
		// align-self
		case 5443:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'flex-item-' + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /flex-|-self/g, '') + (!(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(value, /flex-|baseline/) ? _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'grid-row-' + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /flex-|-self/g, '') : '') + value
		// align-content
		case 4675:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'flex-line-pack' + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /align-content|flex-|-self/g, '') + value
		// flex-shrink
		case 5548:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, 'shrink', 'negative') + value
		// flex-basis
		case 5292:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, 'basis', 'preferred-size') + value
		// flex-grow
		case 6060:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + 'box-' + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, '-grow', '') + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, 'grow', 'positive') + value
		// transition
		case 4554:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /([^-])(transform)/g, '$1' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + '$2') + value
		// cursor
		case 6187:
			return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(zoom-|grab)/, _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + '$1'), /(image-set)/, _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + '$1'), value, '') + value
		// background, background-image
		case 5495: case 3959:
			return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(image-set\([^]*)/, _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + '$1' + '$`$1')
		// justify-content
		case 4968:
			return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(.+:)(flex-)?(.*)/, _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + 'box-pack:$3' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + value + value
		// justify-self
		case 4200:
			if (!(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(value, /flex-|baseline/)) return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'grid-column-align' + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.substr)(value, length) + value
			break
		// grid-template-(columns|rows)
		case 2592: case 3360:
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, 'template-', '') + value
		// grid-(row|column)-start
		case 4384: case 3616:
			if (children && children.some(function (element, index) { return length = index, (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(element.props, /grid-\w+-end/) })) {
				return ~(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.indexof)(value + (children = children[length].value), 'span') ? value : (_Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, '-start', '') + value + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + 'grid-row-span:' + (~(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.indexof)(children, 'span') ? (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(children, /\d+/) : +(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(children, /\d+/) - +(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(value, /\d+/)) + ';')
			}
			return _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, '-start', '') + value
		// grid-(row|column)-end
		case 4896: case 4128:
			return (children && children.some(function (element) { return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.match)(element.props, /grid-\w+-start/) })) ? value : _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, '-end', '-span'), 'span ', '') + value
		// (margin|padding)-inline-(start|end)
		case 4095: case 3583: case 4068: case 2532:
			return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(.+)-inline(.+)/, _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + '$1$2') + value
		// (min|max)?(width|height|inline-size|block-size)
		case 8116: case 7059: case 5753: case 5535:
		case 5445: case 5701: case 4933: case 4677:
		case 5533: case 5789: case 5021: case 4765:
			// stretch, max-content, min-content, fill-available
			if ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.strlen)(value) - 1 - length > 6)
				switch ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, length + 1)) {
					// (m)ax-content, (m)in-content
					case 109:
						// -
						if ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, length + 4) !== 45)
							break
					// (f)ill-available, (f)it-content
					case 102:
						return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(.+:)(.+)-([^]+)/, '$1' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + '$2-$3' + '$1' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MOZ + ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, length + 3) == 108 ? '$3' : '$2-$3')) + value
					// (s)tretch
					case 115:
						return ~(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.indexof)(value, 'stretch') ? prefix((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, 'stretch', 'fill-available'), length, children) + value : value
				}
			break
		// grid-(column|row)
		case 5152: case 5920:
			return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function (_, a, b, c, d, e, f) { return (_Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + a + ':' + b + f) + (c ? (_Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + a + '-span:' + (d ? e : +e - +b)) + f : '') + value })
		// position: sticky
		case 4949:
			// stick(y)?
			if ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, length + 6) === 121)
				return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, ':', ':' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT) + value
			break
		// display: (flex|inline-flex|grid|inline-grid)
		case 6444:
			switch ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, 14) === 45 ? 18 : 11)) {
				// (inline-)?fle(x)
				case 120:
					return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, '$1' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + ((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.WEBKIT + '$2$3' + '$1' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS + '$2box$3') + value
				// (inline-)?gri(d)
				case 100:
					return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, ':', ':' + _Enum_js__WEBPACK_IMPORTED_MODULE_1__.MS) + value
			}
			break
		// scroll-margin, scroll-margin-(top|right|bottom|left)
		case 5719: case 2647: case 2135: case 3927: case 2391:
			return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.replace)(value, 'scroll-', 'scroll-snap-') + value
	}

	return value
}


/***/ }),

/***/ "./node_modules/stylis/src/Serializer.js":
/*!***********************************************!*\
  !*** ./node_modules/stylis/src/Serializer.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "serialize": () => (/* binding */ serialize),
/* harmony export */   "stringify": () => (/* binding */ stringify)
/* harmony export */ });
/* harmony import */ var _Enum_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Enum.js */ "./node_modules/stylis/src/Enum.js");
/* harmony import */ var _Utility_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utility.js */ "./node_modules/stylis/src/Utility.js");



/**
 * @param {object[]} children
 * @param {function} callback
 * @return {string}
 */
function serialize (children, callback) {
	var output = ''
	var length = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.sizeof)(children)

	for (var i = 0; i < length; i++)
		output += callback(children[i], i, children, callback) || ''

	return output
}

/**
 * @param {object} element
 * @param {number} index
 * @param {object[]} children
 * @param {function} callback
 * @return {string}
 */
function stringify (element, index, children, callback) {
	switch (element.type) {
		case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.LAYER: if (element.children.length) break
		case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.IMPORT: case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.DECLARATION: return element.return = element.return || element.value
		case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.COMMENT: return ''
		case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.KEYFRAMES: return element.return = element.value + '{' + serialize(element.children, callback) + '}'
		case _Enum_js__WEBPACK_IMPORTED_MODULE_1__.RULESET: element.value = element.props.join(',')
	}

	return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.strlen)(children = serialize(element.children, callback)) ? element.return = element.value + '{' + children + '}' : ''
}


/***/ }),

/***/ "./node_modules/stylis/src/Tokenizer.js":
/*!**********************************************!*\
  !*** ./node_modules/stylis/src/Tokenizer.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "line": () => (/* binding */ line),
/* harmony export */   "column": () => (/* binding */ column),
/* harmony export */   "length": () => (/* binding */ length),
/* harmony export */   "position": () => (/* binding */ position),
/* harmony export */   "character": () => (/* binding */ character),
/* harmony export */   "characters": () => (/* binding */ characters),
/* harmony export */   "node": () => (/* binding */ node),
/* harmony export */   "copy": () => (/* binding */ copy),
/* harmony export */   "char": () => (/* binding */ char),
/* harmony export */   "prev": () => (/* binding */ prev),
/* harmony export */   "next": () => (/* binding */ next),
/* harmony export */   "peek": () => (/* binding */ peek),
/* harmony export */   "caret": () => (/* binding */ caret),
/* harmony export */   "slice": () => (/* binding */ slice),
/* harmony export */   "token": () => (/* binding */ token),
/* harmony export */   "alloc": () => (/* binding */ alloc),
/* harmony export */   "dealloc": () => (/* binding */ dealloc),
/* harmony export */   "delimit": () => (/* binding */ delimit),
/* harmony export */   "tokenize": () => (/* binding */ tokenize),
/* harmony export */   "whitespace": () => (/* binding */ whitespace),
/* harmony export */   "tokenizer": () => (/* binding */ tokenizer),
/* harmony export */   "escaping": () => (/* binding */ escaping),
/* harmony export */   "delimiter": () => (/* binding */ delimiter),
/* harmony export */   "commenter": () => (/* binding */ commenter),
/* harmony export */   "identifier": () => (/* binding */ identifier)
/* harmony export */ });
/* harmony import */ var _Utility_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utility.js */ "./node_modules/stylis/src/Utility.js");


var line = 1
var column = 1
var length = 0
var position = 0
var character = 0
var characters = ''

/**
 * @param {string} value
 * @param {object | null} root
 * @param {object | null} parent
 * @param {string} type
 * @param {string[] | string} props
 * @param {object[] | string} children
 * @param {number} length
 */
function node (value, root, parent, type, props, children, length) {
	return {value: value, root: root, parent: parent, type: type, props: props, children: children, line: line, column: column, length: length, return: ''}
}

/**
 * @param {object} root
 * @param {object} props
 * @return {object}
 */
function copy (root, props) {
	return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.assign)(node('', null, null, '', null, null, 0), root, {length: -root.length}, props)
}

/**
 * @return {number}
 */
function char () {
	return character
}

/**
 * @return {number}
 */
function prev () {
	character = position > 0 ? (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(characters, --position) : 0

	if (column--, character === 10)
		column = 1, line--

	return character
}

/**
 * @return {number}
 */
function next () {
	character = position < length ? (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(characters, position++) : 0

	if (column++, character === 10)
		column = 1, line++

	return character
}

/**
 * @return {number}
 */
function peek () {
	return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.charat)(characters, position)
}

/**
 * @return {number}
 */
function caret () {
	return position
}

/**
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
function slice (begin, end) {
	return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.substr)(characters, begin, end)
}

/**
 * @param {number} type
 * @return {number}
 */
function token (type) {
	switch (type) {
		// \0 \t \n \r \s whitespace token
		case 0: case 9: case 10: case 13: case 32:
			return 5
		// ! + , / > @ ~ isolate token
		case 33: case 43: case 44: case 47: case 62: case 64: case 126:
		// ; { } breakpoint token
		case 59: case 123: case 125:
			return 4
		// : accompanied token
		case 58:
			return 3
		// " ' ( [ opening delimit token
		case 34: case 39: case 40: case 91:
			return 2
		// ) ] closing delimit token
		case 41: case 93:
			return 1
	}

	return 0
}

/**
 * @param {string} value
 * @return {any[]}
 */
function alloc (value) {
	return line = column = 1, length = (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.strlen)(characters = value), position = 0, []
}

/**
 * @param {any} value
 * @return {any}
 */
function dealloc (value) {
	return characters = '', value
}

/**
 * @param {number} type
 * @return {string}
 */
function delimit (type) {
	return (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.trim)(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)))
}

/**
 * @param {string} value
 * @return {string[]}
 */
function tokenize (value) {
	return dealloc(tokenizer(alloc(value)))
}

/**
 * @param {number} type
 * @return {string}
 */
function whitespace (type) {
	while (character = peek())
		if (character < 33)
			next()
		else
			break

	return token(type) > 2 || token(character) > 3 ? '' : ' '
}

/**
 * @param {string[]} children
 * @return {string[]}
 */
function tokenizer (children) {
	while (next())
		switch (token(character)) {
			case 0: (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.append)(identifier(position - 1), children)
				break
			case 2: ;(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.append)(delimit(character), children)
				break
			default: ;(0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.append)((0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.from)(character), children)
		}

	return children
}

/**
 * @param {number} index
 * @param {number} count
 * @return {string}
 */
function escaping (index, count) {
	while (--count && next())
		// not 0-9 A-F a-f
		if (character < 48 || character > 102 || (character > 57 && character < 65) || (character > 70 && character < 97))
			break

	return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32))
}

/**
 * @param {number} type
 * @return {number}
 */
function delimiter (type) {
	while (next())
		switch (character) {
			// ] ) " '
			case type:
				return position
			// " '
			case 34: case 39:
				if (type !== 34 && type !== 39)
					delimiter(character)
				break
			// (
			case 40:
				if (type === 41)
					delimiter(type)
				break
			// \
			case 92:
				next()
				break
		}

	return position
}

/**
 * @param {number} type
 * @param {number} index
 * @return {number}
 */
function commenter (type, index) {
	while (next())
		// //
		if (type + character === 47 + 10)
			break
		// /*
		else if (type + character === 42 + 42 && peek() === 47)
			break

	return '/*' + slice(index, position - 1) + '*' + (0,_Utility_js__WEBPACK_IMPORTED_MODULE_0__.from)(type === 47 ? type : next())
}

/**
 * @param {number} index
 * @return {string}
 */
function identifier (index) {
	while (!token(peek()))
		next()

	return slice(index, position)
}


/***/ }),

/***/ "./node_modules/stylis/src/Utility.js":
/*!********************************************!*\
  !*** ./node_modules/stylis/src/Utility.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "abs": () => (/* binding */ abs),
/* harmony export */   "from": () => (/* binding */ from),
/* harmony export */   "assign": () => (/* binding */ assign),
/* harmony export */   "hash": () => (/* binding */ hash),
/* harmony export */   "trim": () => (/* binding */ trim),
/* harmony export */   "match": () => (/* binding */ match),
/* harmony export */   "replace": () => (/* binding */ replace),
/* harmony export */   "indexof": () => (/* binding */ indexof),
/* harmony export */   "charat": () => (/* binding */ charat),
/* harmony export */   "substr": () => (/* binding */ substr),
/* harmony export */   "strlen": () => (/* binding */ strlen),
/* harmony export */   "sizeof": () => (/* binding */ sizeof),
/* harmony export */   "append": () => (/* binding */ append),
/* harmony export */   "combine": () => (/* binding */ combine)
/* harmony export */ });
/**
 * @param {number}
 * @return {number}
 */
var abs = Math.abs

/**
 * @param {number}
 * @return {string}
 */
var from = String.fromCharCode

/**
 * @param {object}
 * @return {object}
 */
var assign = Object.assign

/**
 * @param {string} value
 * @param {number} length
 * @return {number}
 */
function hash (value, length) {
	return charat(value, 0) ^ 45 ? (((((((length << 2) ^ charat(value, 0)) << 2) ^ charat(value, 1)) << 2) ^ charat(value, 2)) << 2) ^ charat(value, 3) : 0
}

/**
 * @param {string} value
 * @return {string}
 */
function trim (value) {
	return value.trim()
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 * @return {string?}
 */
function match (value, pattern) {
	return (value = pattern.exec(value)) ? value[0] : value
}

/**
 * @param {string} value
 * @param {(string|RegExp)} pattern
 * @param {string} replacement
 * @return {string}
 */
function replace (value, pattern, replacement) {
	return value.replace(pattern, replacement)
}

/**
 * @param {string} value
 * @param {string} search
 * @return {number}
 */
function indexof (value, search) {
	return value.indexOf(search)
}

/**
 * @param {string} value
 * @param {number} index
 * @return {number}
 */
function charat (value, index) {
	return value.charCodeAt(index) | 0
}

/**
 * @param {string} value
 * @param {number} begin
 * @param {number} end
 * @return {string}
 */
function substr (value, begin, end) {
	return value.slice(begin, end)
}

/**
 * @param {string} value
 * @return {number}
 */
function strlen (value) {
	return value.length
}

/**
 * @param {any[]} value
 * @return {number}
 */
function sizeof (value) {
	return value.length
}

/**
 * @param {any} value
 * @param {any[]} array
 * @return {any}
 */
function append (value, array) {
	return array.push(value), value
}

/**
 * @param {string[]} array
 * @param {function} callback
 * @return {string}
 */
function combine (array, callback) {
	return array.map(callback).join('')
}


/***/ }),

/***/ "./src/components/SignIn.tsx":
/*!***********************************!*\
  !*** ./src/components/SignIn.tsx ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SignIn": () => (/* binding */ SignIn)
/* harmony export */ });
/* harmony import */ var _emotion_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/css */ "./node_modules/@emotion/css/dist/emotion-css.development.esm.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context/Appconda */ "./src/context/Appconda.tsx");



const GoogleLogo = () => (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", height: "1.25em", viewBox: "0 0 600 600", width: "1.25em" },
    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { d: "M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z", fill: "#4285f4" }),
    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { d: "M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z", fill: "#34a853" }),
    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { d: "M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z", fill: "#fbbc04" }),
    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { d: "M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z", fill: "#ea4335" })));
const pageContainer = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    display: flex;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    overflow: scroll;
    align-items: flex-start;
    padding-top: clamp(2rem, 10vw, 5rem);
    background-color:#ffffff;
`;
const devBanner = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    background-color: #6c47ff;
    color: #fff;
    font-family: Inter, system-ui, sans-serif;
    font-weight: 400;
    font-size: 14px;
    padding: 1rem 2rem;
    position: fixed;
    text-align: center;
    bottom: 0;
    width: 100vw;
    z-index: 20;
`;
const componentContainer = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    margin-bottom: 5rem;
`;
const rootBox = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    
`;
const cardBox = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    isolation: isolate;
    max-width: calc(-2.5rem + 100vw);
    width: 25rem;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.07);
    border-radius: 0.75rem;
    color: rgb(33, 33, 38);
    position: relative;
    overflow: hidden;
    border-width: 0px;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 5px 15px 0px, rgba(25, 28, 33, 0.2) 0px 15px 35px -5px, rgba(0, 0, 0, 0.07) 0px 0px 0px 1px;
`;
const card = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    gap: 2rem;
    background-color: white;
    transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 200ms;
    text-align: center;
    z-index: 10;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.03);
    border-radius: 0.5rem;
    position: relative;
    padding: 2rem 2.5rem;
    -webkit-box-pack: center;
    place-content: center;
    border-width: 0px;
    box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 2px 0px, rgba(25, 28, 33, 0.06) 0px 1px 2px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px;
`;
const cardHeader = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
   box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;
`;
const cardHeaderInternal = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 0.25rem;
`;
const headerTitle = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    color: rgb(33, 33, 38);
    margin: 0px;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 700;
    font-size: 1.0625rem;
    line-height: 1.41176;


`;
const headerSubtitle = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    margin: 0px;
    font-size: 0.8125rem;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 400;
    line-height: 1.38462;
    color: rgb(116, 118, 134);
    overflow-wrap: break-word;

`;
const main = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;

`;
const mainInternal = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 0.5rem;

`;
const socialButtons = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: grid;
    -webkit-box-align: stretch;
    align-items: stretch;
    gap: 0.5rem;
    -webkit-box-pack: center;
    justify-content: center;
    grid-template-columns: repeat(1, 1fr);

`;
const socialButtonsBlockButton = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    border-width: 0px;
    box-shadow: rgba(0, 0, 0, 0.07) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 2px 3px -1px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px;
    margin: 0px;
    padding: 0.375rem 0.75rem;
    border-width: 1px;
    outline: 0px;
    user-select: none;
    cursor: pointer;
    background-color: unset;
    color: rgba(0, 0, 0, 0.62);
    border-radius: 0.375rem;
    isolation: isolate;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 100ms;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 500;
    font-size: 0.8125rem;
    line-height: 1.38462;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.07);
    box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 3px -1px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px;
    width: 100%;
    --accent: hsla(252, 100%, 63%, 1);
    --accentHover: hsla(252, 100%, 73%, 1);
    --border: hsla(252, 100%, 63%, 1);
    --accentContrast: white;
    --alpha: hsla(0, 0%, 0%, 0.03);
    gap: 1rem;
    position: relative;
    -webkit-box-pack: start;
    justify-content: flex-start;

    &:hover {
        background-color: rgba(0, 0, 0, 0.03);
    }
`;
const socialButtonsBlockButtonSpan = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    overflow: hidden;
`;
const socialButtonsBlockButtonSpan2 = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
   box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    flex: 0 0 1rem;
`;
const buttonTextGoogle = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
   box-sizing: border-box;
    margin: 0px;
    font-size: 0.8125rem;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 500;
    line-height: 1.38462;
    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;
const dividerRow = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
`;
const dividerLine = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    display: flex;
    flex-flow: row;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    flex: 1 1 0%;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.07);
`;
const dividerText = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
    box-sizing: border-box;
    font-size: 0.8125rem;
    font-family: inherit;
    letter-spacing: normal;
    font-weight: 400;
    line-height: 1.38462;
    color: rgb(116, 118, 134);
    margin: 0px 1rem;
`;
_emotion_css__WEBPACK_IMPORTED_MODULE_0__.injectGlobal `

.cl-internal-w8uam1 {
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;
}

.cl-internal-1yma7i9 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: justify;
justify-content: space-between;
gap: 1rem;
}

.cl-internal-10rdw13 {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
position: relative;
flex: 1 1 auto;
}

.cl-internal-11m7oop {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
gap: 0.5rem;
}

.cl-internal-66mzqw {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: justify;
justify-content: space-between;
}

.cl-internal-1c7fjmu {
color: rgb(33, 33, 38);
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
display: flex;
-webkit-box-align: center;
align-items: center;
}


.cl-internal-1vc8j8r {
box-sizing: border-box;
margin: 0px;
padding: 0.375rem 0.75rem;
background-color: white;
color: rgb(19, 19, 22);
outline: transparent solid 2px;
outline-offset: 2px;
max-height: 2.25rem;
width: 100%;
aspect-ratio: unset;
accent-color: rgb(104, 66, 255);
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
font-size: 0.8125rem;
line-height: 1.38462;
border-radius: 0.375rem;
border-width: 1px;
border-style: solid;
border-color: rgba(0, 0, 0, 0.11);
box-shadow: rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-timing-function: ease;
transition-duration: 200ms;
}

.cl-internal-1vc8j8r[data-variant="default"] {
border-width: 0px;
box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 0px 1px, rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
}

.cl-internal-ct77wn {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
animation: 450ms ease 0s 1 normal none running animation-9p3mh3;
transition-property: height;
transition-duration: 200ms;
transition-timing-function: ease;
}

.cl-internal-1kxguf4 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: justify;
justify-content: space-between;
gap: 1rem;
position: absolute;
opacity: 0;
height: 0px;
pointer-events: none;
margin-top: -1rem;
}

.cl-internal-10rdw13 {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
position: relative;
flex: 1 1 auto;
}

.cl-internal-11m7oop {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
gap: 0.5rem;
}

.cl-internal-66mzqw {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: justify;
justify-content: space-between;
}

.cl-internal-1c7fjmu {
color: rgb(33, 33, 38);
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
display: flex;
-webkit-box-align: center;
align-items: center;
}

.cl-internal-i1u4p8 {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: center;
justify-content: center;
position: relative;
}

.cl-internal-18nsyma {
box-sizing: border-box;
margin: 0px;
padding: 0.375rem 2.5rem 0.375rem 0.75rem;
background-color: white;
color: rgb(19, 19, 22);
outline: transparent solid 2px;
outline-offset: 2px;
max-height: 2.25rem;
width: 100%;
aspect-ratio: unset;
accent-color: rgb(104, 66, 255);
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
font-size: 0.8125rem;
line-height: 1.38462;
border-radius: 0.375rem;
border-width: 1px;
border-style: solid;
border-color: rgba(0, 0, 0, 0.11);
box-shadow: rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-timing-function: ease;
transition-duration: 200ms;
}

.cl-internal-18nsyma[data-variant="default"] {
border-width: 0px;
box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 0px 1px, rgba(0, 0, 0, 0.07) 0px 0px 1px 0px;
}

.cl-internal-1ab5cam {
margin: 0px 0.25rem 0px 0px;
padding: 0.25rem 0.75rem;
border-width: 0px;
outline: 0px;
user-select: none;
cursor: pointer;
background-color: unset;
border-radius: 0.375rem;
isolation: isolate;
display: inline-flex;
-webkit-box-pack: center;
justify-content: center;
-webkit-box-align: center;
align-items: center;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-duration: 100ms;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
--accent: hsla(252, 100%, 63%, 1);
--accentHover: hsla(252, 100%, 73%, 1);
--border: hsla(252, 100%, 63%, 1);
--accentContrast: white;
--alpha: hsla(0, 0%, 0%, 0.03);
position: absolute;
right: 0px;
color: rgba(0, 0, 0, 0.41);
}

.cl-internal-oaq42g {
flex-shrink: 0;
width: 1rem;
height: 1rem;
}

.cl-internal-ct77wn {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
animation: 450ms ease 0s 1 normal none running animation-9p3mh3;
transition-property: height;
transition-duration: 200ms;
transition-timing-function: ease;
}

.cl-internal-10liqrf {
margin: 0px;
padding: 0.375rem 0.75rem;
border-width: 1px;
outline: 0px;
user-select: none;
cursor: pointer;
background-color: var(--accent);
color: var(--accentContrast);
border-radius: 0.375rem;
position: relative;
isolation: isolate;
display: inline-flex;
-webkit-box-pack: center;
justify-content: center;
-webkit-box-align: center;
align-items: center;
transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
transition-duration: 100ms;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
box-shadow: rgba(255, 255, 255, 0.07) 0px 1px 1px 0px inset, rgba(34, 42, 53, 0.2) 0px 2px 3px 0px, rgba(0, 0, 0, 0.24) 0px 1px 1px 0px;
border-style: solid;
border-color: var(--accent);
width: 100%;
--accent: hsla(252, 100%, 63%, 1);
--accentHover: hsla(252, 100%, 73%, 1);
--border: hsla(252, 100%, 63%, 1);
--accentContrast: white;
--alpha: hsla(0, 0%, 0%, 0.03);
}

.cl-internal-10liqrf[data-variant="solid"][data-color="primary"] {
box-shadow: rgb(104, 66, 255) 0px 0px 0px 1px, rgba(255, 255, 255, 0.07) 0px 1px 1px 0px inset, rgba(34, 42, 53, 0.2) 0px 2px 3px 0px, rgba(0, 0, 0, 0.24) 0px 1px 1px 0px;
}

.cl-internal-4x6jej {
box-sizing: border-box;
display: flex;
flex-flow: column;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
margin-top: -0.5rem;
padding-top: 0.5rem;
background: linear-gradient(rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03)), linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255));
}

.cl-internal-1rpdi70 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: start;
justify-content: flex-start;
gap: 0.25rem;
margin: 0px auto;
}

.cl-internal-kyvqj0 {
box-sizing: border-box;
margin: 0px;
font-size: 0.8125rem;
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
line-height: 1.38462;
color: rgb(116, 118, 134);
}

.cl-internal-27wqok {
box-sizing: border-box;
display: inline-flex;
-webkit-box-align: center;
align-items: center;
margin: 0px;
cursor: pointer;
text-decoration: none;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
font-size: 0.8125rem;
line-height: 1.38462;
color: rgb(104, 66, 255);
}

.cl-internal-1dauvpw {
box-sizing: border-box;
width: 100%;
position: relative;
isolation: isolate;
}

.cl-internal-4x6jej > :not(:first-of-type) {
padding: 1rem 2rem;
border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.cl-internal-piyvrh {
box-sizing: border-box;
user-select: none;
pointer-events: none;
inset: 0px;
position: absolute;
background: repeating-linear-gradient(-45deg, rgba(243, 104, 18, 0.07), rgba(243, 104, 18, 0.07) 6px, rgba(243, 104, 18, 0.11) 6px, rgba(243, 104, 18, 0.11) 12px);
mask-image: linear-gradient(transparent 0%, black);
}

.cl-internal-df7v37 {
box-sizing: border-box;
display: flex;
flex-flow: column;
gap: 0.5rem;
margin-left: auto;
margin-right: auto;
width: 100%;
-webkit-box-pack: center;
justify-content: center;
-webkit-box-align: center;
align-items: center;
z-index: 1;
position: relative;
}

.cl-internal-y44tp9 {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: stretch;
align-items: stretch;
-webkit-box-pack: justify;
justify-content: space-between;
width: 100%;
}

.cl-internal-y44tp9:has(div:only-child) {
-webkit-box-pack: center;
justify-content: center;
}

.cl-internal-16mc20d {
box-sizing: border-box;
display: flex;
flex-flow: row;
-webkit-box-align: center;
align-items: center;
-webkit-box-pack: center;
justify-content: center;
gap: 0.25rem;
color: rgb(116, 118, 134);
}

.cl-internal-wf8x4b {
box-sizing: border-box;
margin: 0px;
font-size: 0.75rem;
font-family: inherit;
letter-spacing: normal;
font-weight: 500;
line-height: 1.33333;
color: inherit;
}

.cl-internal-1fcj7sw {
box-sizing: border-box;
display: inline-flex;
-webkit-box-align: center;
align-items: center;
margin: 0px;
cursor: pointer;
text-decoration: none;
font-family: inherit;
letter-spacing: normal;
font-weight: 400;
font-size: 0.8125rem;
line-height: 1.38462;
color: inherit;
}

.cl-internal-5ghyhf {
flex-shrink: 0;
width: 3rem;
height: 0.875rem;
}

.cl-internal-16vtwdp {
box-sizing: border-box;
margin: 0px;
font-size: 0.8125rem;
font-family: inherit;
letter-spacing: normal;
line-height: 1.38462;
color: rgb(243, 107, 22);
font-weight: 600;
padding: 0px;
}

.cl-internal-10liqrf[data-variant="solid"]::after {
    position: absolute;
    content: "";
    border-radius: inherit;
    z-index: -1;
    inset: 0px;
    opacity: 1;
    transition-property: background-color, background, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 100ms;
    background: linear-gradient(rgba(255, 255, 255, 0.11) 0%, transparent 100%);
}

.cl-internal-1c4ikgf {
    flex-shrink: 0;
    margin-left: 0.5rem;
    width: 0.625rem;
    height: 0.625rem;
    opacity: 0.62;
}

.cl-internal-10liqrf:hover {
    background-color: var(--accentHover);
}

`;
const form = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
  box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 2rem;


`;
const formInternalDiv = _emotion_css__WEBPACK_IMPORTED_MODULE_0__.css `
  box-sizing: border-box;
    display: flex;
    flex-flow: column;
    -webkit-box-align: stretch;
    align-items: stretch;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 1.5rem;
`;
const SignIn = ({ title, onSuccess }) => {
    const [email, setEmail] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    const [password, setPassword] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    const appconda = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_2__.useAppconda)();
    const createEmalSession = async () => {
        try {
            await appconda.account.createEmailPasswordSession(email, password);
            onSuccess?.();
        }
        catch {
        }
    };
    //mert@example.com
    return (react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: pageContainer },
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: devBanner },
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", null, "Clerk is in development mode. Sign up or sign in to continue.")),
        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: componentContainer },
            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: rootBox },
                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: cardBox },
                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: card },
                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: cardHeader },
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: cardHeaderInternal },
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("h1", { className: headerTitle, "data-localization-key": "signIn.start.title" }, `Sign in to ${title}`),
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", { className: headerSubtitle, "data-localization-key": "signIn.start.subtitle" }, "Welcome back! Please sign in to continue"))),
                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: main },
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: mainInternal },
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: socialButtons },
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("button", { className: socialButtonsBlockButton, "data-variant": "outline", "data-color": "primary" },
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("span", { className: socialButtonsBlockButtonSpan },
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("span", { className: socialButtonsBlockButtonSpan2 },
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement(GoogleLogo, null)),
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("span", { className: buttonTextGoogle, "data-localization-key": "socialButtonsBlockButton" }, "Continue with Google"))))),
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: dividerRow },
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: dividerLine }),
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", { className: dividerText, "data-localization-key": "dividerText" }, "or"),
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: dividerLine })),
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: form },
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: formInternalDiv },
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formFieldRow cl-formFieldRow__identifier \uD83D\uDD12\uFE0F cl-internal-1yma7i9" },
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formField cl-formField__identifier \uD83D\uDD12\uFE0F cl-internal-10rdw13" },
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-11m7oop" },
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formFieldLabelRow cl-formFieldLabelRow__identifier \uD83D\uDD12\uFE0F cl-internal-66mzqw" },
                                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("label", { className: "cl-formFieldLabel cl-formFieldLabel__identifier-field cl-required \uD83D\uDD12\uFE0F cl-internal-1c7fjmu", "data-localization-key": "formFieldLabel__emailAddress" }, "Email address")),
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("input", { className: "cl-formFieldInput cl-input cl-formFieldInput__identifier cl-input__identifier cl-required \uD83D\uDD12\uFE0F\n                                                     cl-internal-1vc8j8r", id: "identifier-field", name: "identifier", placeholder: "", type: "text", pattern: "^.*@[a-zA-Z0-9\\-]+\\.[a-zA-Z0-9\\-\\.]+$", required: true, "aria-invalid": "false", "aria-required": "true", "aria-disabled": "false", "data-feedback": "info", "data-variant": "default", value: email, onChange: (event) => setEmail(event.target.value) })),
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-ct77wn", style: { height: '0px', position: 'relative' } }))),
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formFieldRow cl-formFieldRow__password \uD83D\uDD12\uFE0F cl-internal-1kxguf4" },
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formField cl-formField__password \uD83D\uDD12\uFE0F cl-internal-10rdw13" },
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-11m7oop" },
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formFieldLabelRow cl-formFieldLabelRow__password \uD83D\uDD12\uFE0F cl-internal-66mzqw" },
                                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("label", { className: "cl-formFieldLabel cl-formFieldLabel__password-field \uD83D\uDD12\uFE0F cl-internal-1c7fjmu", "data-localization-key": "formFieldLabel__password" }, "Password")),
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formFieldInputGroup \uD83D\uDD12\uFE0F cl-internal-i1u4p8" },
                                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("input", { className: "cl-formFieldInput cl-input cl-formFieldInput__password cl-input__password \uD83D\uDD12\uFE0F\n                                                         cl-internal-18nsyma", name: "password", tabIndex: -1, placeholder: "", type: "password", id: "password-field", "aria-invalid": "false", "aria-required": "false", "aria-disabled": "false", "data-feedback": "info", "data-variant": "default", value: "" }),
                                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("button", { className: "cl-formFieldInputShowPasswordButton cl-button \uD83D\uDD12\uFE0F cl-internal-1ab5cam", "aria-label": "Show password", tabIndex: -1, "data-variant": "ghost", "data-color": "primary" },
                                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("svg", { fill: "currentColor", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", className: "cl-formFieldInputShowPasswordIcon \uD83D\uDD12\uFE0F cl-internal-oaq42g" },
                                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { d: "M8 9.607c.421 0 .825-.17 1.123-.47a1.617 1.617 0 0 0 0-2.273 1.578 1.578 0 0 0-2.246 0 1.617 1.617 0 0 0 0 2.272c.298.302.702.471 1.123.471Z" }),
                                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M2.07 8.38a1.073 1.073 0 0 1 0-.763 6.42 6.42 0 0 1 2.334-2.99A6.302 6.302 0 0 1 8 3.5c2.704 0 5.014 1.71 5.93 4.12.094.246.093.518 0 .763a6.418 6.418 0 0 1-2.334 2.99A6.301 6.301 0 0 1 8 12.5c-2.704 0-5.013-1.71-5.93-4.12ZM10.54 8c0 .682-.267 1.336-.743 1.818A2.526 2.526 0 0 1 8 10.571c-.674 0-1.32-.27-1.796-.753A2.587 2.587 0 0 1 5.459 8c0-.682.268-1.336.745-1.818A2.525 2.525 0 0 1 8 5.429c.674 0 1.32.27 1.797.753.476.482.744 1.136.744 1.818Z" }))))),
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-ct77wn", style: { height: '0px', position: 'relative' } })))),
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-11m7oop" },
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formFieldLabelRow cl-formFieldLabelRow__password \uD83D\uDD12\uFE0F cl-internal-66mzqw" },
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("label", { className: "cl-formFieldLabel cl-formFieldLabel__password-field \uD83D\uDD12\uFE0F cl-internal-1c7fjmu", "data-localization-key": "formFieldLabel__password" }, "Password"),
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("a", { className: "cl-formFieldAction cl-formFieldAction__password \uD83D\uDD12\uFE0F cl-internal-v0hosy", "data-localization-key": "formFieldAction__forgotPassword", href: "" }, "Forgot password?")),
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-formFieldInputGroup \uD83D\uDD12\uFE0F cl-internal-i1u4p8" },
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("input", { className: "cl-formFieldInput cl-input cl-formFieldInput__password cl-input__password \uD83D\uDD12\uFE0F cl-internal-18nsyma", name: "password", placeholder: "", type: "password", id: "password-field", "aria-invalid": "false", "aria-required": "false", "aria-disabled": "false", "data-feedback": "info", "data-variant": "default", value: password, onChange: (event) => setPassword(event.target.value) }),
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("button", { className: "cl-formFieldInputShowPasswordButton cl-button \uD83D\uDD12\uFE0F cl-internal-1ab5cam", "aria-label": "Show password", "data-variant": "ghost", "data-color": "primary" },
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("svg", { fill: "currentColor", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", className: "cl-formFieldInputShowPasswordIcon \uD83D\uDD12\uFE0F cl-internal-oaq42g" },
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { d: "M8 9.607c.421 0 .825-.17 1.123-.47a1.617 1.617 0 0 0 0-2.273 1.578 1.578 0 0 0-2.246 0 1.617 1.617 0 0 0 0 2.272c.298.302.702.471 1.123.471Z" }),
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M2.07 8.38a1.073 1.073 0 0 1 0-.763 6.42 6.42 0 0 1 2.334-2.99A6.302 6.302 0 0 1 8 3.5c2.704 0 5.014 1.71 5.93 4.12.094.246.093.518 0 .763a6.418 6.418 0 0 1-2.334 2.99A6.301 6.301 0 0 1 8 12.5c-2.704 0-5.013-1.71-5.93-4.12ZM10.54 8c0 .682-.267 1.336-.743 1.818A2.526 2.526 0 0 1 8 10.571c-.674 0-1.32-.27-1.796-.753A2.587 2.587 0 0 1 5.459 8c0-.682.268-1.336.745-1.818A2.525 2.525 0 0 1 8 5.429c.674 0 1.32.27 1.797.753.476.482.744 1.136.744 1.818Z" }))))),
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("button", { className: "cl-formButtonPrimary cl-button \uD83D\uDD12\uFE0F cl-internal-10liqrf", "data-localization-key": "formButtonPrimary", "data-variant": "solid", "data-color": "primary", onClick: createEmalSession },
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("span", { className: "cl-internal-2iusy0" },
                                        "Continue",
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("svg", { className: "cl-buttonArrowIcon \uD83D\uDD12\uFE0F cl-internal-1c4ikgf" },
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { fill: "currentColor", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "1.5", d: "m7.25 5-3.5-2.25v4.5L7.25 5Z" }))))))),
                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-footer \uD83D\uDD12\uFE0F cl-internal-4x6jej" },
                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-footerAction cl-footerAction__signIn \uD83D\uDD12\uFE0F cl-internal-1rpdi70" },
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("span", { className: "cl-footerActionText \uD83D\uDD12\uFE0F cl-internal-kyvqj0", "data-localization-key": "signIn.start.actionText" }, "Don\u2019t have an account?"),
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("a", { className: "cl-footerActionLink \uD83D\uDD12\uFE0F cl-internal-27wqok", "data-localization-key": "signIn.start.actionLink", href: "https://careful-labrador-89.accounts.dev/sign-up" }, "Sign up")),
                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-1dauvpw" },
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-piyvrh" }),
                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-df7v37" },
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-y44tp9" },
                                    react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", { className: "cl-internal-16mc20d" },
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", { className: "cl-internal-wf8x4b" }, "Secured by"),
                                        react__WEBPACK_IMPORTED_MODULE_1___default().createElement("a", { "aria-label": "Clerk logo", className: "cl-internal-1fcj7sw", href: "https://www.clerk.com?utm_source=clerk&utm_medium=components", target: "_blank", rel: "noopener" },
                                            react__WEBPACK_IMPORTED_MODULE_1___default().createElement("svg", { fill: "none", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 50 14", className: "cl-internal-5ghyhf" },
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("ellipse", { cx: "7.889", cy: "7", rx: "2.187", ry: "2.188", fill: "currentColor" }),
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { d: "M11.83 12.18a.415.415 0 0 1-.05.64A6.967 6.967 0 0 1 7.888 14a6.967 6.967 0 0 1-3.891-1.18.415.415 0 0 1-.051-.64l1.598-1.6a.473.473 0 0 1 .55-.074 3.92 3.92 0 0 0 1.794.431 3.92 3.92 0 0 0 1.792-.43.473.473 0 0 1 .551.074l1.599 1.598Z", fill: "currentColor" }),
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { opacity: "0.5", d: "M11.78 1.18a.415.415 0 0 1 .05.64l-1.598 1.6a.473.473 0 0 1-.55.073 3.937 3.937 0 0 0-5.3 5.3.473.473 0 0 1-.074.55L2.71 10.942a.415.415 0 0 1-.641-.051 7 7 0 0 1 9.71-9.71Z", fill: "currentColor" }),
                                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M23.748 1.422c0-.06.05-.11.11-.11h1.64c.06 0 .11.05.11.11v11.156a.11.11 0 0 1-.11.11h-1.64a.11.11 0 0 1-.11-.11V1.422Zm-2.315 8.9a.112.112 0 0 0-.15.004 2.88 2.88 0 0 1-.884.569c-.36.148-.747.222-1.137.219-.33.01-.658-.047-.965-.166a2.422 2.422 0 0 1-.817-.527c-.424-.432-.668-1.05-.668-1.785 0-1.473.98-2.48 2.45-2.48.394-.005.785.074 1.144.234.325.144.617.35.86.607.04.044.11.049.155.01l1.108-.959a.107.107 0 0 0 .01-.152c-.832-.93-2.138-1.412-3.379-1.412-2.499 0-4.27 1.686-4.27 4.166 0 1.227.44 2.26 1.182 2.99.743.728 1.801 1.157 3.022 1.157 1.53 0 2.763-.587 3.485-1.34a.107.107 0 0 0-.009-.155l-1.137-.98Zm13.212-1.14a.108.108 0 0 1-.107.096H28.79a.106.106 0 0 0-.104.132c.286 1.06 1.138 1.701 2.302 1.701a2.59 2.59 0 0 0 1.136-.236 2.55 2.55 0 0 0 .862-.645.08.08 0 0 1 .112-.01l1.155 1.006c.044.039.05.105.013.15-.698.823-1.828 1.42-3.38 1.42-2.386 0-4.185-1.651-4.185-4.162 0-1.232.424-2.264 1.13-2.994.373-.375.82-.67 1.314-.87a3.968 3.968 0 0 1 1.557-.285c2.419 0 3.983 1.701 3.983 4.05a6.737 6.737 0 0 1-.04.647Zm-5.924-1.524a.104.104 0 0 0 .103.133h3.821c.07 0 .123-.066.103-.134-.26-.901-.921-1.503-1.947-1.503a2.13 2.13 0 0 0-.88.16 2.1 2.1 0 0 0-.733.507 2.242 2.242 0 0 0-.467.837Zm11.651-3.172c.061-.001.11.048.11.109v1.837a.11.11 0 0 1-.117.109 7.17 7.17 0 0 0-.455-.024c-1.43 0-2.27 1.007-2.27 2.329v3.732a.11.11 0 0 1-.11.11h-1.64a.11.11 0 0 1-.11-.11v-7.87c0-.06.049-.109.11-.109h1.64c.06 0 .11.05.11.11v1.104a.011.011 0 0 0 .02.007c.64-.857 1.587-1.333 2.587-1.333l.125-.001Zm4.444 4.81a.035.035 0 0 1 .056.006l2.075 3.334a.11.11 0 0 0 .093.052h1.865a.11.11 0 0 0 .093-.168L46.152 7.93a.11.11 0 0 1 .012-.131l2.742-3.026a.11.11 0 0 0-.081-.183h-1.946a.11.11 0 0 0-.08.036l-3.173 3.458a.11.11 0 0 1-.19-.074V1.422a.11.11 0 0 0-.11-.11h-1.64a.11.11 0 0 0-.11.11v11.156c0 .06.05.11.11.11h1.64a.11.11 0 0 0 .11-.11v-1.755a.11.11 0 0 1 .03-.075l1.35-1.452Z", fill: "currentColor" }))))),
                                react__WEBPACK_IMPORTED_MODULE_1___default().createElement("p", { className: "cl-internal-16vtwdp" }, "Development mode")))))))));
};


/***/ }),

/***/ "./src/components/SignOutButton.tsx":
/*!******************************************!*\
  !*** ./src/components/SignOutButton.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SignOutButton": () => (/* binding */ SignOutButton)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../context/Appconda */ "./src/context/Appconda.tsx");


const SignOutButton = ({ onLogOut, onError }) => {
    const appconda = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda)();
    const sigOut = async () => {
        try {
            await appconda.account.deleteSession('current');
            onLogOut?.();
        }
        catch (e) {
            onError(e);
        }
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { onClick: sigOut }, "Sign out"));
};


/***/ }),

/***/ "./src/components/index.ts":
/*!*********************************!*\
  !*** ./src/components/index.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SignIn": () => (/* reexport safe */ _SignIn__WEBPACK_IMPORTED_MODULE_0__.SignIn),
/* harmony export */   "SignOutButton": () => (/* reexport safe */ _SignOutButton__WEBPACK_IMPORTED_MODULE_1__.SignOutButton)
/* harmony export */ });
/* harmony import */ var _SignIn__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SignIn */ "./src/components/SignIn.tsx");
/* harmony import */ var _SignOutButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SignOutButton */ "./src/components/SignOutButton.tsx");




/***/ }),

/***/ "./src/context/Appconda.tsx":
/*!**********************************!*\
  !*** ./src/context/Appconda.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "query": () => (/* binding */ query),
/* harmony export */   "AppcondaProvider": () => (/* binding */ AppcondaProvider),
/* harmony export */   "useAppconda": () => (/* binding */ useAppconda)
/* harmony export */ });
/* harmony import */ var _appconda_web_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @appconda/web-sdk */ "./node_modules/@appconda/web-sdk/index.js");
/* harmony import */ var _appconda_web_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_appconda_web_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @tanstack/react-query */ "@tanstack/react-query");
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);



const query = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__.QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: false
        }
    },
});
const AppcondaContext = (0,react__WEBPACK_IMPORTED_MODULE_2__.createContext)(null);
function AppcondaProvider({ endPoint, project, children }) {
    const client = new _appconda_web_sdk__WEBPACK_IMPORTED_MODULE_0__.Client().setEndpoint(endPoint).setProject(project);
    const sdk = {
        account: new _appconda_web_sdk__WEBPACK_IMPORTED_MODULE_0__.Account(client)
    };
    return (react__WEBPACK_IMPORTED_MODULE_2___default().createElement(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_1__.QueryClientProvider, { client: query },
        react__WEBPACK_IMPORTED_MODULE_2___default().createElement(AppcondaContext.Provider, { value: sdk }, children)));
}
function useAppconda() {
    return (0,react__WEBPACK_IMPORTED_MODULE_2__.useContext)(AppcondaContext);
}


/***/ }),

/***/ "./src/hooks/account/index.ts":
/*!************************************!*\
  !*** ./src/hooks/account/index.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCreateAccount": () => (/* reexport safe */ _useCreateAccount__WEBPACK_IMPORTED_MODULE_0__.useCreateAccount),
/* harmony export */   "useCreateJWT": () => (/* reexport safe */ _useCreateJWT__WEBPACK_IMPORTED_MODULE_1__.useCreateJWT),
/* harmony export */   "useCreateEmailVerification": () => (/* reexport safe */ _useCreateEmailVerification__WEBPACK_IMPORTED_MODULE_2__.useCreateEmailVerification),
/* harmony export */   "useCreateEmailSession": () => (/* reexport safe */ _useCreateEmailSession__WEBPACK_IMPORTED_MODULE_3__.useCreateEmailSession),
/* harmony export */   "useGetMe": () => (/* reexport safe */ _useGetMe__WEBPACK_IMPORTED_MODULE_4__.useGetMe),
/* harmony export */   "useCreateAnonymousSession": () => (/* reexport safe */ _useCreateAnonymousSession__WEBPACK_IMPORTED_MODULE_5__.useCreateAnonymousSession)
/* harmony export */ });
/* harmony import */ var _useCreateAccount__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./useCreateAccount */ "./src/hooks/account/useCreateAccount.ts");
/* harmony import */ var _useCreateJWT__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useCreateJWT */ "./src/hooks/account/useCreateJWT.ts");
/* harmony import */ var _useCreateEmailVerification__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./useCreateEmailVerification */ "./src/hooks/account/useCreateEmailVerification.ts");
/* harmony import */ var _useCreateEmailSession__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./useCreateEmailSession */ "./src/hooks/account/useCreateEmailSession.ts");
/* harmony import */ var _useGetMe__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./useGetMe */ "./src/hooks/account/useGetMe.ts");
/* harmony import */ var _useCreateAnonymousSession__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./useCreateAnonymousSession */ "./src/hooks/account/useCreateAnonymousSession.ts");








/***/ }),

/***/ "./src/hooks/account/useCreateAccount.ts":
/*!***********************************************!*\
  !*** ./src/hooks/account/useCreateAccount.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCreateAccount": () => (/* binding */ useCreateAccount)
/* harmony export */ });
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tanstack/react-query */ "@tanstack/react-query");
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../context/Appconda */ "./src/context/Appconda.tsx");
/* harmony import */ var _appconda_web_sdk__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @appconda/web-sdk */ "./node_modules/@appconda/web-sdk/index.js");
/* harmony import */ var _appconda_web_sdk__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_appconda_web_sdk__WEBPACK_IMPORTED_MODULE_2__);



/**
 * Hook to create a new account.
 *
 * This hook allows you to create a new account using the Appconda SDK.
 * It invalidates the 'account' query to refetch the updated data after a successful account creation.
 * @returns An object containing the `createAccount` function, as well as the mutation state.
 */
const useCreateAccount = () => {
    const queryClient = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useQueryClient)();
    const sdk = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda)();
    const mutation = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useMutation)({
        mutationFn: ({ name, email, password }) => {
            return sdk.account.create(_appconda_web_sdk__WEBPACK_IMPORTED_MODULE_2__.ID.unique(), email, password, name);
        },
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['account'] });
        }
    });
    const createAccount = ({ name, email, password, organizationId }, onSuccess = void 0) => {
        mutation.mutate({ name, email, password }, {
            onSuccess: (data) => {
                onSuccess(data);
            }
        });
    };
    return {
        createAccount,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error
    };
};


/***/ }),

/***/ "./src/hooks/account/useCreateAnonymousSession.ts":
/*!********************************************************!*\
  !*** ./src/hooks/account/useCreateAnonymousSession.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCreateAnonymousSession": () => (/* binding */ useCreateAnonymousSession)
/* harmony export */ });
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tanstack/react-query */ "@tanstack/react-query");
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../context/Appconda */ "./src/context/Appconda.tsx");


/**
 * Hook to create an anonymous session.
 *
 * This hook allows you to create an anonymous session using the Appconda SDK.
 * It invalidates the 'accounts' query to refetch the updated data after a successful session creation.
 * @returns An object containing the `createAnonymousSession` function, as well as the mutation state.
 */
const useCreateAnonymousSession = () => {
    const queryClient = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useQueryClient)();
    const sdk = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda)();
    const mutation = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useMutation)({
        mutationFn: () => {
            return sdk.account.createAnonymousSession();
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
    });
    const createAnonymousSession = (onSuccess = void 0) => {
        mutation.mutate(null, {
            onSuccess: () => {
                onSuccess();
            }
        });
    };
    return {
        createAnonymousSession,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error
    };
};


/***/ }),

/***/ "./src/hooks/account/useCreateEmailSession.ts":
/*!****************************************************!*\
  !*** ./src/hooks/account/useCreateEmailSession.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCreateEmailSession": () => (/* binding */ useCreateEmailSession)
/* harmony export */ });
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tanstack/react-query */ "@tanstack/react-query");
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../context/Appconda */ "./src/context/Appconda.tsx");


/**
 * Hook to create an email session for a user.
 *
 * This hook allows you to create a session for a user using their email and password.
 * It uses the Appconda SDK to create the session and then invalidates the 'accounts' query
 * to refetch the updated data.
 * @returns An object containing the `createEmailSession` function, as well as the mutation state.
 */
const useCreateEmailSession = () => {
    const queryClient = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useQueryClient)();
    const sdk = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda)();
    const mutation = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useMutation)({
        mutationFn: ({ email, password }) => {
            return sdk.account.createEmailPasswordSession(email, password);
        },
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
    });
    const createEmailSession = ({ email, password }, onSuccess = void 0) => {
        mutation.mutate({ email, password }, {
            onSuccess: (data) => {
                onSuccess(data);
            }
        });
    };
    return {
        createEmailSession,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error
    };
};


/***/ }),

/***/ "./src/hooks/account/useCreateEmailVerification.ts":
/*!*********************************************************!*\
  !*** ./src/hooks/account/useCreateEmailVerification.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCreateEmailVerification": () => (/* binding */ useCreateEmailVerification)
/* harmony export */ });
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tanstack/react-query */ "@tanstack/react-query");
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../context/Appconda */ "./src/context/Appconda.tsx");


/**
 * This hook facilitates the process of sending a verification email to users, ensuring they are the rightful owners of the provided email address.
 * It utilizes the userId and secret as query parameters in the URL that will be included in the verification email.
 * The specified URL should guide the user back to your application, enabling the completion of the verification by checking
 * the userId and secret parameters. For further details on the verification process, refer to the documentation.
 * The verification link sent to the user's email remains valid for a duration of 7 days.
 * To prevent Redirect Attacks, only redirect URLs from domains specified in your platform settings within the console are permitted.
 */
const useCreateEmailVerification = (projectId) => {
    const queryClient = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useQueryClient)();
    const sdk = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda)();
    const mutation = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useMutation)({
        mutationFn: ({ url }) => {
            return sdk.account.createVerification(url);
        },
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
    });
    const createVerification = ({ url }, onSuccess = void 0) => {
        mutation.mutate({ url }, {
            onSuccess: (data) => {
                onSuccess(data);
            }
        });
    };
    return {
        createVerification,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error
    };
};


/***/ }),

/***/ "./src/hooks/account/useCreateJWT.ts":
/*!*******************************************!*\
  !*** ./src/hooks/account/useCreateJWT.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCreateJWT": () => (/* binding */ useCreateJWT)
/* harmony export */ });
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tanstack/react-query */ "@tanstack/react-query");
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../context/Appconda */ "./src/context/Appconda.tsx");


const useCreateJWT = (projectId) => {
    const queryClient = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useQueryClient)();
    const sdk = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda)();
    const mutation = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useMutation)({
        mutationFn: () => {
            return sdk.account.createJWT();
        },
        onSuccess: (data) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['account'] });
        }
    });
    const createJWT = (onSuccess = void 0) => {
        mutation.mutate(null, {
            onSuccess: (data) => {
                onSuccess(data);
            }
        });
    };
    return {
        createJWT,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error
    };
};


/***/ }),

/***/ "./src/hooks/account/useGetMe.ts":
/*!***************************************!*\
  !*** ./src/hooks/account/useGetMe.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useGetMe": () => (/* binding */ useGetMe)
/* harmony export */ });
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tanstack/react-query */ "@tanstack/react-query");
/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../context/Appconda */ "./src/context/Appconda.tsx");


const useGetMe = () => {
    const sdk = (0,_context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda)();
    const query = (0,_tanstack_react_query__WEBPACK_IMPORTED_MODULE_0__.useQuery)({
        queryKey: ['account', 'get'], queryFn: () => {
            return sdk.account.get();
        }
    });
    return { me: query.data, isLoading: query.isLoading, isError: query.isError, error: query.error };
};


/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__tanstack_react_query__;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SignIn": () => (/* reexport safe */ _components__WEBPACK_IMPORTED_MODULE_0__.SignIn),
/* harmony export */   "SignOutButton": () => (/* reexport safe */ _components__WEBPACK_IMPORTED_MODULE_0__.SignOutButton),
/* harmony export */   "AppcondaProvider": () => (/* reexport safe */ _context_Appconda__WEBPACK_IMPORTED_MODULE_1__.AppcondaProvider),
/* harmony export */   "query": () => (/* reexport safe */ _context_Appconda__WEBPACK_IMPORTED_MODULE_1__.query),
/* harmony export */   "useAppconda": () => (/* reexport safe */ _context_Appconda__WEBPACK_IMPORTED_MODULE_1__.useAppconda),
/* harmony export */   "useCreateAccount": () => (/* reexport safe */ _hooks_account__WEBPACK_IMPORTED_MODULE_2__.useCreateAccount),
/* harmony export */   "useCreateAnonymousSession": () => (/* reexport safe */ _hooks_account__WEBPACK_IMPORTED_MODULE_2__.useCreateAnonymousSession),
/* harmony export */   "useCreateEmailSession": () => (/* reexport safe */ _hooks_account__WEBPACK_IMPORTED_MODULE_2__.useCreateEmailSession),
/* harmony export */   "useCreateEmailVerification": () => (/* reexport safe */ _hooks_account__WEBPACK_IMPORTED_MODULE_2__.useCreateEmailVerification),
/* harmony export */   "useCreateJWT": () => (/* reexport safe */ _hooks_account__WEBPACK_IMPORTED_MODULE_2__.useCreateJWT),
/* harmony export */   "useGetMe": () => (/* reexport safe */ _hooks_account__WEBPACK_IMPORTED_MODULE_2__.useGetMe)
/* harmony export */ });
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components */ "./src/components/index.ts");
/* harmony import */ var _context_Appconda__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./context/Appconda */ "./src/context/Appconda.tsx");
/* harmony import */ var _hooks_account__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./hooks/account */ "./src/hooks/account/index.ts");




})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=index.js.map
// console.log('forms-core module loaded.');
