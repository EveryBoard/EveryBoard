export abstract class Encoder<T> {
    public readonly maxValue: number
    public shift(): number {
        return this.maxValue + 1;
    }
    public abstract encode(t: T): number
    public abstract decode(n: number): T
}

export namespace Encoder {
    export const booleanEncoder: Encoder<boolean> = new class extends Encoder<boolean> {
        public readonly maxValue: number = 1;
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

    export function arrayEncoder<T>(encoder: Encoder<T>, maxLength: number): Encoder<ReadonlyArray<T>> {
        return new class extends Encoder<ReadonlyArray<T>> {
            public readonly maxValue: number = encoder.maxValue * maxLength;
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
                return array;
            }
        };
    }
}
