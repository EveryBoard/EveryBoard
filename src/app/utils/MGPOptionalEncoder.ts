import { Encoder } from 'src/app/jscaip/Encoder';
import { MGPOptional } from './MGPOptional';
import { JSONValue } from './utils';

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
