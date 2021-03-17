export abstract class Encoder<T> {
    public abstract maxValue(): number
    public shift(): number {
        return this.maxValue() + 1;
    }
    public abstract encode(t: T): number
    public abstract decode(n: number): T
}

export namespace Encoder {
    export function of<T>(max: number, encode: (t: T) => number, decode: (n: number) => T): Encoder<T> {
        return new class extends Encoder<T> {
            public maxValue(): number {
                return max;
            }
            public encode(t: T): number {
                return encode(t);
            }
            public decode(n: number): T {
                return decode(n);
            }
        };
    }

    export const booleanEncoder: Encoder<boolean> = new class extends Encoder<boolean> {
        public maxValue(): number {
            return 1;
        }
        public encode(b: boolean): number {
            if (b) {
                return 1;
            } else {
                return 0;
            }
        }
        public decode(n: number): boolean {
            if (n === 0) return false;
            if (n === 1) return true;
            throw new Error('Invalid encoded boolean');
        }
    };

    export function numberEncoder(max: number): Encoder<number> {
        return new class extends Encoder<number> {
            public maxValue(): number {
                return max;
            }
            public encode(n: number): number {
                if (n > max) {
                    throw new Error('Cannot encode number bigger than the max with numberEncoder');
                }
                return n;
            }
            public decode(encoded: number): number {
                return encoded % max;
            }
        };
    }

    export function arrayEncoder<T>(encoder: Encoder<T>, maxLength: number): Encoder<ReadonlyArray<T>> {
        return new class extends Encoder<ReadonlyArray<T>> {
            public maxValue(): number {
                let max: number = 0;
                for (let i: number = 0; i <= maxLength; i++) {
                    max = (max + encoder.maxValue()) * encoder.shift();
                }
                max += maxLength;
                return max;
            }
            public encode(array: ReadonlyArray<T>): number {
                let encoded: number = 0;
                array.forEach((v: T) => {
                    encoded = encoded * encoder.shift() + encoder.encode(v);
                });
                encoded = encoded * (maxLength+1) + array.length;
                return encoded;
            }
            public decode(encoded: number): ReadonlyArray<T> {
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
