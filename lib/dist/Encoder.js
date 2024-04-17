"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncoderTestUtils = exports.Encoder = void 0;
const Utils_1 = require("./Utils");
class Encoder {
    static fromFunctions(toJSON, fromJSON) {
        return new class extends Encoder {
            encode(value) {
                return toJSON(value);
            }
            decode(encoded) {
                return fromJSON(encoded);
            }
        };
    }
    static identity() {
        function identity(x) {
            return x;
        }
        return Encoder.fromFunctions(identity, identity);
    }
    static constant(constant, onlyValue) {
        return new class extends Encoder {
            encode(_value) {
                return constant;
            }
            decode(_encoded) {
                return onlyValue;
            }
        };
    }
    static tuple(encoders, encode, decode) {
        return new class extends Encoder {
            encode(value) {
                const fields = encode(value);
                const encoded = {};
                Object.keys(fields).forEach((key) => {
                    encoded[key] = encoders[key].encode(fields[key]);
                });
                return encoded;
            }
            decode(encoded) {
                const fields = {};
                Object.keys(encoders).reverse().forEach((key) => {
                    const field = encoded[key];
                    fields[key] = encoders[key].decode(field);
                });
                return decode(Object.values(fields));
            }
        };
    }
    /**
     * This creates a "sum" encoder, i.e., it encodes values of either type T and U and V and ...
     */
    static disjunction(typePredicates, encoders) {
        Utils_1.Utils.assert(typePredicates.length === encoders.length, 'typePredicates and encoders should have same length');
        return new class extends Encoder {
            encode(value) {
                let indexClass = 0;
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
            decode(encoded) {
                // eslint-disable-next-line dot-notation
                const type_ = Utils_1.Utils.getNonNullable(encoded)['type'];
                // eslint-disable-next-line dot-notation
                const content = Utils_1.Utils.getNonNullable(encoded)['encoded'];
                return encoders[type_].decode(content);
            }
        };
    }
    static list(encoder) {
        return new class extends Encoder {
            encode(list) {
                return list.map((t) => {
                    const encodedCoord = encoder.encode(t);
                    Utils_1.Utils.assert(Array.isArray(encodedCoord) === false, 'This encoder should not encode as array');
                    return encodedCoord;
                });
            }
            decode(encoded) {
                const casted = encoded;
                return casted.map(encoder.decode);
            }
        };
    }
}
exports.Encoder = Encoder;
/**
 * This is a helper class to test encoders
 */
class EncoderTestUtils {
    static expectToBeBijective(encoder, value) {
        const encoded = encoder.encode(value);
        const decoded = encoder.decode(encoded);
        expect(decoded).withContext(`Expected decoded value (${decoded}) to be ${value}`).toEqual(value);
    }
}
exports.EncoderTestUtils = EncoderTestUtils;
//# sourceMappingURL=Encoder.js.map