import { ComparableObject } from 'src/app/utils/Comparable';
import { JSONValue } from 'src/app/utils/utils';
import { Encoder, NumberEncoder } from '../Encoder';
import { Player } from '../Player';

export class EncoderTestUtils {
    public static expectToBeCorrect<T extends ComparableObject>(encoder: Encoder<T>, value: T): void {
        const encoded: JSONValue = encoder.encode(value);
        const decoded: T = encoder.decode(encoded);
        expect(decoded.equals(value));
    }
}

export class NumberEncoderTestUtils {
    public static expectToBeCorrect<T>(encoder: NumberEncoder<T>, value: T): void {
        const encoded: number = encoder.encodeNumber(value);
        expect(encoded).toBeLessThanOrEqual(encoder.maxValue());
        const decoded: T = encoder.decodeNumber(encoded);
        expect(decoded).toEqual(value);
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
    describe('tuple', () => {
        class T implements ComparableObject {
            public constructor(public field1: boolean, public field2: number, public field3: Player) {}
            public equals(t: T): boolean {
                return this.field1 === t.field1 && this.field2 === t.field2 && this.field3 === t.field3;
            }
        }
        const encoder: NumberEncoder<T> = NumberEncoder.tuple<T, [boolean, number, Player]>(
            [NumberEncoder.booleanEncoder, NumberEncoder.numberEncoder(5), Player.numberEncoder],
            (t: T): [boolean, number, Player] => [t.field1, t.field2, t.field3],
            (fields: [boolean, number, Player]): T => new T(fields[0], fields[1], fields[2]));
        it('should successfully encode and decode', () => {
            NumberEncoderTestUtils.expectToBeCorrect(encoder, new T(true, 3, Player.ONE));
            NumberEncoderTestUtils.expectToBeCorrect(encoder, new T(false, 2, Player.ONE));
        });
    });
    describe('disjunction', () => {
        const encoder1: NumberEncoder<number> = NumberEncoder.numberEncoder(5);
        const encoder2: NumberEncoder<boolean> = NumberEncoder.booleanEncoder;
        const encoder: NumberEncoder<number | boolean> =
            NumberEncoder.disjunction(encoder1,
                                      encoder2,
                                      (value : number | boolean): value is number => {
                                          return typeof(value) === 'number';
                                      });
        it('should successfully encode and decode', () => {
            NumberEncoderTestUtils.expectToBeCorrect(encoder, 0 as number | boolean);
            NumberEncoderTestUtils.expectToBeCorrect(encoder, 1 as number | boolean);
            NumberEncoderTestUtils.expectToBeCorrect(encoder, 3 as number | boolean);
            NumberEncoderTestUtils.expectToBeCorrect(encoder, true as number | boolean);
            NumberEncoderTestUtils.expectToBeCorrect(encoder, false as number | boolean);
        });
    });
});
