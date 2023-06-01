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
    public static tuple<T, Fields extends object>(encoders: EncoderArray<Fields>,
                                                  encode: (t: T) => Fields,
                                                  decode: (fields: Fields) => T): Encoder<T> {
        return new class extends Encoder<T> {
            public encode(value: T): JSONValueWithoutArray {
                const fields: Fields = encode(value);
                const encoded: JSONValueWithoutArray = {};
                Object.keys(fields).forEach((key: string): void => {
                    encoded[key] = encoders[key].encode(fields[key]);
                });
                return encoded;
            }
            public decode(encoded: NonNullable<JSONValueWithoutArray>): T {
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
     * This creates a "sum" encoder, i.e., it encodes values of either type T and U
     */
    public static disjunction<T, U>(encoderT: Encoder<T>,
                                    encoderU: Encoder<U>,
                                    isT: (v: T | U) => v is T)
    : Encoder<T | U>
    {
        return new class extends Encoder<T | U> {
            public encode(value: T | U): JSONValueWithoutArray {
                if (isT(value)) {
                    return {
                        type: 'T',
                        encoded: encoderT.encode(value),
                    };
                } else {
                    return {
                        type: 'U',
                        encoded: encoderU.encode(value),
                    };
                }
            }
            public decode(encoded: JSONValueWithoutArray): T | U {
                // eslint-disable-next-line dot-notation
                const type_: string = Utils.getNonNullable(encoded)['type'];
                // eslint-disable-next-line dot-notation
                const content: JSONValue = Utils.getNonNullable(encoded)['encoded'] as JSONValue;
                if (type_ === 'T') {
                    return encoderT.decode(content);
                } else {
                    return encoderU.decode(content);
                }
            }
        };
    }
    public static disjunction3<T, U, V>(encoderT: Encoder<T>,
                                        encoderU: Encoder<U>,
                                        encoderV: Encoder<V>,
                                        isT: (v: T | U | V) => v is T,
                                        isU: (v: T | U | V) => v is U)
    : Encoder<T | U | V> {
        return new class extends Encoder<T | U | V> {
            public encode(value: T | U | V): JSONValueWithoutArray {
                if (isT(value)) {
                    return {
                        type: 'T',
                        encoded: encoderT.encode(value),
                    };
                } else if (isU(value)) {
                    return {
                        type: 'U',
                        encoded: encoderU.encode(value),
                    };
                } else {
                    return {
                        type: 'V',
                        encoded: encoderV.encode(value),
                    };
                }
            }
            public decode(encoded: JSONValueWithoutArray): T | U | V {
                // eslint-disable-next-line dot-notation
                const type_: string = Utils.getNonNullable(encoded)['type'];
                // eslint-disable-next-line dot-notation
                const content: JSONValue = Utils.getNonNullable(encoded)['encoded'] as JSONValue;
                if (type_ === 'T') {
                    return encoderT.decode(content);
                } else if (type_ === 'U') {
                    return encoderU.decode(content);
                } else {
                    return encoderV.decode(content);
                }
            }
        };
    }
    public static getListEncoder<T>(encoder: Encoder<T>): Encoder<Array<T>> {
        return new class extends Encoder<Array<T>> {
            public encode(list: T[]): JSONValue {
                return list.map((t: T): JSONValueWithoutArray => {
                    const encodedCoord: JSONValue = encoder.encode(t);
                    Utils.assert(Array.isArray(encodedCoord) === false,
                                 'This encoder should not encode as array');
                    return encodedCoord as JSONValueWithoutArray;
                }); // TODO FOR REVIEW: une idée de si il reste de encoders qu'on échappé à la Perfection Christique ?
            }
            public decode(encoded: JSONValue): T[] {
                const casted: Array<JSONValue> = encoded as Array<JSONValue>;
                return casted.map(encoder.decode);
            }
        };
    }
    public abstract encode(move: T): JSONValue;

    public abstract decode(encodedMove: JSONValue): T;
}
