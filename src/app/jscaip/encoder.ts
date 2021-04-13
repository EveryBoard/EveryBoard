import { assert, JSONValue } from '../utils/collection-lib/utils';

export abstract class Encoder<T> {
    public abstract encode(t: T): JSONValue;
    public abstract decode(encoded: JSONValue): T;
}
export namespace Encoder {
    export function of<T>(encode: (t: T) => JSONValue, decode: (n: JSONValue) => T): Encoder<T> {
        return new class extends Encoder<T> {
            public encode(t: T): JSONValue {
                return encode(t);
            }
            public decode(n: JSONValue): T {
                return decode(n);
            }
        };
    }
}

export abstract class NumberEncoder<T> extends Encoder<T> {
    public abstract maxValue(): number
    public shift(): number {
        return this.maxValue() + 1;
    }
    public abstract encodeNumber(t: T): number
    public encode(t: T): JSONValue {
        return this.encodeNumber(t);
    }
    public abstract decodeNumber(n: number): T
    public decode(n: JSONValue): T {
        assert(typeof n === 'number', 'Invalid encoded number');
        return this.decodeNumber(n as number);
    }
}

export namespace NumberEncoder {
    export function ofN<T>(max: number, encodeNumber: (t: T) => number, decodeNumber: (n: number) => T): NumberEncoder<T> {
        return new class extends NumberEncoder<T> {
            public maxValue(): number {
                return max;
            }
            public encodeNumber(t: T): number {
                return encodeNumber(t);
            }
            public decodeNumber(n: number): T {
                return decodeNumber(n);
            }
        };
    }

    export const booleanEncoder: NumberEncoder<boolean> = new class extends NumberEncoder<boolean> {
        public maxValue(): number {
            return 1;
        }
        public encodeNumber(b: boolean): number {
            if (b) {
                return 1;
            } else {
                return 0;
            }
        }
        public decodeNumber(n: number): boolean {
            if (n === 0) return false;
            if (n === 1) return true;
            throw new Error('Invalid encoded boolean');
        }
    };

    export function numberEncoder(max: number): NumberEncoder<number> {
        return new class extends NumberEncoder<number> {
            public maxValue(): number {
                return max;
            }
            public encodeNumber(n: number): number {
                if (n > max) {
                    throw new Error('Cannot encode number bigger than the max with numberEncoder');
                }
                return n;
            }
            public decodeNumber(encoded: number): number {
                return encoded % max;
            }
        };
    }

    export function arrayEncoder<T>(encoder: NumberEncoder<T>, maxLength: number): NumberEncoder<ReadonlyArray<T>> {
        return new class extends NumberEncoder<ReadonlyArray<T>> {
            public maxValue(): number {
                let max: number = 0;
                for (let i: number = 0; i <= maxLength; i++) {
                    max = (max + encoder.maxValue()) * encoder.shift();
                }
                max += maxLength;
                return max;
            }
            public encodeNumber(array: ReadonlyArray<T>): number {
                let encoded: number = 0;
                array.forEach((v: T) => {
                    encoded = encoded * encoder.shift() + encoder.encodeNumber(v);
                });
                encoded = encoded * (maxLength+1) + array.length;
                return encoded;
            }
            public decodeNumber(encoded: number): ReadonlyArray<T> {
                const size: number = encoded % (maxLength+1);
                encoded = (encoded - size) / (maxLength+1);
                const array: T[] = [];
                for (let i: number = 0; i < size; i++) {
                    const valueN: number = encoded % encoder.shift();
                    encoded = (encoded - valueN) / encoder.shift();
                    array.push(encoder.decode(valueN));
                }
                return array.reverse();
            }
        };
    }
}
