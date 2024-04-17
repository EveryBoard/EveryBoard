"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MGPOptional = void 0;
const Comparable_1 = require("./Comparable");
const Encoder_1 = require("./Encoder");
class MGPOptional {
    value;
    static of(value) {
        return new MGPOptional(value);
    }
    static ofNullable(value) {
        if (value == null)
            return MGPOptional.empty();
        return MGPOptional.of(value);
    }
    static empty() {
        return new MGPOptional(null);
    }
    /**
     * Encodes a MGPOptional<T> using an encoder of T.
     * It will use the same encoding as T, and use null to encode an empty optional.
     */
    static getEncoder(encoderT) {
        return new class extends Encoder_1.Encoder {
            encode(opt) {
                if (opt.isPresent()) {
                    return encoderT.encode(opt.get());
                }
                else {
                    return null;
                }
            }
            decode(encoded) {
                if (encoded === null) {
                    return MGPOptional.empty();
                }
                else {
                    return MGPOptional.of(encoderT.decode(encoded));
                }
            }
        };
    }
    constructor(value) {
        this.value = value;
    }
    isPresent() {
        return this.value != null;
    }
    isAbsent() {
        return this.value == null;
    }
    get() {
        if (this.isPresent()) {
            return this.value;
        }
        else {
            throw new Error('Value is absent');
        }
    }
    getOrElse(defaultValue) {
        if (this.isPresent()) {
            return this.value;
        }
        else {
            return defaultValue;
        }
    }
    equals(other) {
        if (this.isAbsent()) {
            return other.isAbsent();
        }
        if (other.isAbsent()) {
            return false;
        }
        return (0, Comparable_1.comparableEquals)(this.value, other.value);
    }
    equalsValue(other) {
        return this.equals(MGPOptional.of(other));
    }
    toString() {
        if (this.isAbsent()) {
            return 'MGPOptional.empty()';
        }
        else {
            return `MGPOptional.of(${this.value})`;
        }
    }
    map(f) {
        if (this.isPresent()) {
            return MGPOptional.of(f(this.get()));
        }
        else {
            return MGPOptional.empty();
        }
    }
}
exports.MGPOptional = MGPOptional;
//# sourceMappingURL=MGPOptional.js.map