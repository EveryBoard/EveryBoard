import { Encoder, NumberEncoder } from './Encoder';
import { MGPOptional } from './MGPOptional';
import { JSONValue } from './utils';

/**
 * Encodes a MGPOptional<T> using an encoder of T.
 * It will use the same encoding as T, and use null to encode an empty optional.
 */
export function MGPOptionalEncoder<T>(encoderT: Encoder<T>): Encoder<MGPOptional<T>> {
    return new class extends Encoder<MGPOptional<T>> {
        public encode(opt: MGPOptional<T>): JSONValue {
            if (opt.isPresent()) {
                return encoderT.encode(opt.get());
            } else {
                return null;
            }
        }
        public decode(encoded: JSONValue): MGPOptional<T> {
            if (encoded === null) {
                return MGPOptional.empty();
            } else {
                return MGPOptional.of(encoderT.decode(encoded));
            }
        }
    };
}

/**
 * Encodes a MGPOptional<T> into a number using a number encoder of T.
 * It will use the same encoding as T, and use maxValue+1 to encode an empty optional.
 */
export function MGPOptionalNumberEncoder<T>(encoderT: NumberEncoder<T>): NumberEncoder<MGPOptional<T>> {
    return new class extends NumberEncoder<MGPOptional<T>> {
        public maxValue(): number {
            return encoderT.maxValue() + 1;
        }
        public encodeNumber(opt: MGPOptional<T>): number {
            if (opt.isPresent()) {
                return encoderT.encodeNumber(opt.get());
            } else {
                return encoderT.maxValue()+1;
            }
        }
        public decodeNumber(encoded: number): MGPOptional<T> {
            if (encoded === this.maxValue()) {
                return MGPOptional.empty();
            } else {
                return MGPOptional.of(encoderT.decodeNumber(encoded));
            }
        }
    };
}
