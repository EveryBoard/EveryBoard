import { ComparableObject } from 'src/app/utils/Comparable';
import { NumberEncoder } from '../encoder';

export class NumberEncoderTestUtils {
    public static expectToBeCorrect<T extends ComparableObject>(encoder: NumberEncoder<T>, value: T): void {
        const encoded: number = encoder.encodeNumber(value);
        expect(encoded).toBeLessThan(encoder.maxValue());
        const decoded: T = encoder.decodeNumber(encoded);
        expect(decoded.equals(value));
    }
}

describe('NumberEncoder', () => {
    describe('booleanEncoder', () => {
        const encoder: NumberEncoder<boolean> = NumberEncoder.booleanEncoder;
        it('should successfully encode and decode all booleans', () => {
            expect(encoder.decodeNumber(encoder.encodeNumber(true))).toBe(true);
            expect(encoder.decodeNumber(encoder.encodeNumber(false))).toBe(false);
        });
        it('should fail when decoding invalid encoded booleans', () => {
            expect(() => encoder.decodeNumber(42)).toThrow();
        });
    });
    describe('numberEncoder', () => {
        const encoder: NumberEncoder<number> = NumberEncoder.numberEncoder(5);
        it('should successfully encode and decode', () => {
            expect(encoder.decodeNumber(encoder.encodeNumber(0))).toBe(0);
            expect(encoder.decodeNumber(encoder.encodeNumber(5))).toBe(5);
        });
        it('should fail when encoding a number that is too big', () => {
            expect(() => encoder.encodeNumber(42)).toThrow();
        });
        it('should fail when decoding an invalid number', () => {
            expect(() => encoder.decodeNumber(42)).toThrow();
        });
    });
    describe('ofN', () => {
        const magicNumber: number = 42.31415;
        const encode: (x: number) => number = (_: number): number => magicNumber;
        const decode: (x: number) => number = (_: number): number => magicNumber;
        const encoder: NumberEncoder<number> = NumberEncoder.ofN(100, encode, decode);
        it('should delegate encoding to encode function', () => {
            expect(encoder.encodeNumber(0)).toBe(magicNumber);
        });
        it('should delegate decoding to decode function', () => {
            expect(encoder.decodeNumber(0)).toBe(magicNumber);
        });
    });
});
