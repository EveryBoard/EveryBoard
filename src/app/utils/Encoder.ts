import { JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
// Used internally. If T = [A, B, C], then
// EncoderArray<T> = [Encoder<A>, Encoder<B>, Encoder<C>]
type EncoderArray<T> = { [P in keyof T]: Encoder<T[P]> };

export abstract class Encoder<T> {

    public static fromFunctions<U>(toJSON: (value: U) => JSONValueWithoutArray,
                                   fromJSON: (json: JSONValueWithoutArray) => U)
    : Encoder<U> {
        return new class extends Encoder<U> {
            public encode(value: U): JSONValueWithoutArray {
                return toJSON(value);
            }
            public decode(encoded: NonNullable<JSONValueWithoutArray>): U {
                return fromJSON(encoded);
            }
        };
    }
    public static identity<U extends JSONValueWithoutArray>(): Encoder<U> {
        function identity(x: U): U {
            return x;
        }
        return Encoder.fromFunctions(identity, identity);
    }
    public static constant<U>(constant: JSONValueWithoutArray, onlyValue: U): Encoder<U> {
        return new class extends Encoder<U> {
            public encode(_value: U): JSONValueWithoutArray {
                return constant;
            }
            public decode(_encoded: NonNullable<JSONValueWithoutArray>): U {
                return onlyValue;
            }
        };
    }
    public static tuple<U, Fields extends object>(encoders: EncoderArray<Fields>,
                                                  encode: (t: U) => Fields,
                                                  decode: (fields: Fields) => U): Encoder<U> {
        return new class extends Encoder<U> {
            public encode(value: U): JSONValueWithoutArray {
                const fields: Fields = encode(value);
                const encoded: JSONValueWithoutArray = {};
                Object.keys(fields).forEach((key: string): void => {
                    encoded[key] = encoders[key].encode(fields[key]);
                });
                return encoded;
            }
            public decode(encoded: NonNullable<JSONValueWithoutArray>): U {
                const fields: Record<string, unknown> = {};
                Object.keys(encoders).reverse().forEach((key: string): void => {
                    const field: JSONValue = encoded[key] as NonNullable<JSONValue>;
                    fields[key] = encoders[key].decode(field);
                });
                return decode(Object.values(fields) as Fields);
            }
        };
    }
    /**
     * This creates a "sum" encoder, i.e., it encodes values of either type T and U and V and ...
     */
    public static disjunction<U>(typePredicates: ((value: unknown) => boolean)[],
                                 encoders: Encoder<unknown>[],
    ): Encoder<U>
    {
        Utils.assert(typePredicates.length === encoders.length, 'typePredicates and encoders should have same length');
        return new class extends Encoder<U> {
            public encode(value: U): JSONValueWithoutArray {
                let indexClass: number = 0;
                for (const identifier of typePredicates) {
                    if (identifier(value) === true) {
                        return {
                            type: indexClass,
                            encoded: encoders[indexClass].encode(value),
                        };
                    }
                    indexClass++;
                }
            }
            public decode(encoded: JSONValueWithoutArray): U {
                // eslint-disable-next-line dot-notation
                const type_: number = Utils.getNonNullable(encoded)['type'];
                // eslint-disable-next-line dot-notation
                const content: JSONValue = Utils.getNonNullable(encoded)['encoded'] as JSONValue;
                return encoders[type_].decode(content) as U;
            }
        };
    }
    public static list<U>(encoder: Encoder<U>): Encoder<Array<U>> {
        return new class extends Encoder<Array<U>> {
            public encode(list: U[]): JSONValue {
                return list.map((t: U): JSONValueWithoutArray => {
                    const encodedCoord: JSONValue = encoder.encode(t);
                    Utils.assert(Array.isArray(encodedCoord) === false,
                                 'This encoder should not encode as array');
                    return encodedCoord as JSONValueWithoutArray;
                });
            }
            public decode(encoded: JSONValue): U[] {
                const casted: Array<JSONValue> = encoded as Array<JSONValue>;
                return casted.map(encoder.decode);
            }
        };
    }
    public abstract encode(move: T): JSONValue;

    public abstract decode(encodedMove: JSONValue): T;
}
