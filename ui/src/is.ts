
export namespace TypeValue {
    export type Boolean = 'boolean';
    export type Number = 'number';
    export type String = 'string';
    export type Symbol = 'symbol';
    export type Object = 'object';
    export type Undefined = 'undefined';
    export type Function = 'function';

    export type Primitive = String | Number | Boolean;

    export type Any = Primitive
        | Symbol
        | Undefined
        | Function;
}

export const
    VOID0 = <undefined>void (0),
    _BOOLEAN = <TypeValue.Boolean>typeof true,
    _NUMBER = <TypeValue.Number>typeof 0,
    _STRING = <TypeValue.String>typeof "",
    _SYMBOL = <TypeValue.Symbol>"symbol",
    _OBJECT = <TypeValue.Object>typeof {},
    _UNDEFINED = <TypeValue.Undefined>typeof VOID0,
    _FUNCTION = <TypeValue.Function>typeof function () { },
    LENGTH = <string>"length";

export class is {
    public static number(value: any, ignoreNaN: boolean = false): value is number {
        return typeof value === _NUMBER && (!ignoreNaN || !isNaN(value));
    }

     /**
    * Returns true if the value parameter is a string.
    * @param value
    * @returns {boolean}
    */
     public static string(value: any): value is string {
        return typeof value === _STRING;
    }

      /**
     * Returns true if the value parameter is a function.
     * @param value
     * @returns {boolean}
     */
      public static function(value: any): value is Function {
        return typeof value === _FUNCTION;
    }


    public static array<T = any>(value: any): value is Array<T> {
        return Array.isArray(value) || value instanceof Int8Array || value instanceof Uint8Array || value instanceof Int16Array || value instanceof Uint16Array ||
            value instanceof Int32Array || value instanceof Uint32Array || value instanceof Float32Array || value instanceof Float64Array;
    }

    public static nan(value: any): boolean {
        return value !== value;
    }

    public static null(value: any): boolean {
        return value == null;
    }
    public static notNull(value: any): boolean {
        return value != null;
    }

    public static nullOrEmpty(value: any): boolean {
        return is.null(value) || value === '';
    }
}