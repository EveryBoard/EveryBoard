import { JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';

export abstract class AbstractEncoder<T> {

    public abstract encodeValue(move: T): JSONValue;

    public abstract decodeValue(encodedMove: JSONValue): T;
}

// Used internally. If T = [A, B, C], then
// EncoderArray<T> = [Encoder<A>, Encoder<B>, Encoder<C>]
type EncoderArray<T> = { [P in keyof T]: AbstractEncoder<T[P]> };

export abstract class Encoder<T> extends AbstractEncoder<T> {

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
    public static disjunction<T, U>(encoderT: AbstractEncoder<T>,
                                    encoderU: AbstractEncoder<U>,
                                    isT: (v: T | U) => v is T)
    : Encoder<T | U>
    {
        return new class extends Encoder<T | U> {
            public encode(value: T | U): JSONValueWithoutArray {
                if (isT(value)) {
                    return {
                        type: 'T',
                        encoded: encoderT.encodeValue(value),
                    };
                } else {
                    return {
                        type: 'U',
                        encoded: encoderU.encodeValue(value),
                    };
                }
            }
            public decode(encoded: JSONValueWithoutArray): T | U {
                // eslint-disable-next-line dot-notation
                const type_: string = Utils.getNonNullable(encoded)['type'];
                // eslint-disable-next-line dot-notation
                const content: JSONValue = Utils.getNonNullable(encoded)['encoded'] as JSONValue;
                if (type_ === 'T') {
                    return encoderT.decodeValue(content);
                } else {
                    return encoderU.decodeValue(content);
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
                        encoded: encoderT.encodeValue(value),
                    };
                } else if (isU(value)) {
                    return {
                        type: 'U',
                        encoded: encoderU.encodeValue(value),
                    };
                } else {
                    return {
                        type: 'V',
                        encoded: encoderV.encodeValue(value),
                    };
                }
            }
            public decode(encoded: JSONValueWithoutArray): T | U | V {
                // eslint-disable-next-line dot-notation
                const type_: string = Utils.getNonNullable(encoded)['type'];
                // eslint-disable-next-line dot-notation
                const content: JSONValue = Utils.getNonNullable(encoded)['encoded'] as JSONValue;
                if (type_ === 'T') {
                    return encoderT.decodeValue(content);
                } else if (type_ === 'U') {
                    return encoderU.decodeValue(content);
                } else {
                    return encoderV.decodeValue(content);
                }
            }
        };
    }
    public encodeValue(move: T): JSONValue {
        return this.encode(move);
    }
    public abstract encode(move: T): JSONValueWithoutArray;

    public decodeValue(encodedMove: JSONValue): T {
        Utils.assert(Array.isArray(encodedMove) === false, 'MoveEncoder.decode called with an array');
        return this.decode(encodedMove as JSONValueWithoutArray);
    }
    public abstract decode(encodedMove: JSONValueWithoutArray): T;
}
