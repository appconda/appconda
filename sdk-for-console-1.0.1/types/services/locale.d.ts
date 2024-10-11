import { Client } from '../client';
import type { Models } from '../models';
export declare class Locale {
    client: Client;
    constructor(client: Client);
    /**
     * Get user locale
     *
     * Get the current user location based on IP. Returns an object with user country code, country name, continent name, continent code, ip address and suggested currency. You can use the locale header to get the data in a supported language.

([IP Geolocation by DB-IP](https://db-ip.com))
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.Locale>}
     */
    get(): Promise<Models.Locale>;
    /**
     * List Locale Codes
     *
     * List of all locale codes in [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.LocaleCodeList>}
     */
    listCodes(): Promise<Models.LocaleCodeList>;
    /**
     * List continents
     *
     * List of all continents. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.ContinentList>}
     */
    listContinents(): Promise<Models.ContinentList>;
    /**
     * List countries
     *
     * List of all countries. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.CountryList>}
     */
    listCountries(): Promise<Models.CountryList>;
    /**
     * List EU countries
     *
     * List of all countries that are currently members of the EU. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.CountryList>}
     */
    listCountriesEU(): Promise<Models.CountryList>;
    /**
     * List countries phone codes
     *
     * List of all countries phone codes. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.PhoneList>}
     */
    listCountriesPhones(): Promise<Models.PhoneList>;
    /**
     * List currencies
     *
     * List of all currencies, including currency symbol, name, plural, and decimal digits for all major and minor currencies. You can use the locale header to get the data in a supported language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.CurrencyList>}
     */
    listCurrencies(): Promise<Models.CurrencyList>;
    /**
     * List languages
     *
     * List of all languages classified by ISO 639-1 including 2-letter code, name in English, and name in the respective language.
     *
     * @throws {AppwriteException}
     * @returns {Promise<Models.LanguageList>}
     */
    listLanguages(): Promise<Models.LanguageList>;
}
