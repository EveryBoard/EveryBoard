import { JSONValue, JSONValueWithoutArray } from './JSON';
type EncoderArray<T> = {
    [P in keyof T]: Encoder<T[P]>;
};
export declare abstract class Encoder<T> {
    static fromFunctions<U>(toJSON: (value: U) => JSONValueWithoutArray, fromJSON: (json: JSONValueWithoutArray) => U): Encoder<U>;
    static identity<U extends JSONValueWithoutArray>(): Encoder<U>;
    static constant<U>(constant: JSONValueWithoutArray, onlyValue: U): Encoder<U>;
    static tuple<T, Fields extends object>(encoders: EncoderArray<Fields>, encode: (t: T) => Fields, decode: (fields: Fields) => T): Encoder<T>;
    /**
     * This creates a "sum" encoder, i.e., it encodes values of either type T and U and V and ...
     */
    static disjunction<T>(typePredicates: ((value: unknown) => boolean)[], encoders: Encoder<unknown>[]): Encoder<T>;
    static list<T>(encoder: Encoder<T>): Encoder<Array<T>>;
    abstract encode(move: T): JSONValue;
    abstract decode(encodedMove: JSONValue): T;
}
/**
 * This is a helper class to test encoders
 */
export declare class EncoderTestUtils {
    static expectToBeBijective<T>(encoder: Encoder<T>, value: T): void;
}
export {};
