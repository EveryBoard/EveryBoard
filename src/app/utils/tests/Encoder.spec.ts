/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ComparableObject } from 'src/app/utils/Comparable';
import { JSONValue } from 'src/app/utils/utils';
import { Encoder, NumberEncoder } from '../Encoder';

export class EncoderTestUtils {
    public static expectToBeBijective<T extends ComparableObject>(encoder: Encoder<T>, value: T): void {
        const encoded: JSONValue = encoder.encode(value);
        const decoded: T = encoder.decode(encoded);
        expect(decoded.equals(value)).toBeTrue();
    }
}

export class NumberEncoderTestUtils {
    public static expectToBeBijective<T>(encoder: NumberEncoder<T>, value: T): void {
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
        const encoders: [NumberEncoder<boolean>, NumberEncoder<number>, NumberEncoder<PlayerOrNone>] =
            [NumberEncoder.booleanEncoder, NumberEncoder.numberEncoder(5), Player.numberEncoder];
        const encode: (t: T) => [boolean, number, Player] =
            (t: T): [boolean, number, Player] => [t.field1, t.field2, t.field3];
        const decode: (fields: [boolean, number, Player]) => T =
            (fields: [boolean, number, Player]): T => new T(fields[0], fields[1], fields[2]);
        const encoder: NumberEncoder<T> =
            NumberEncoder.tuple<T, [boolean, number, PlayerOrNone]>(encoders, encode, decode);
        it('should have a bijective encoder', () => {
            NumberEncoderTestUtils.expectToBeBijective(encoder, new T(true, 3, Player.ONE));
            NumberEncoderTestUtils.expectToBeBijective(encoder, new T(false, 2, Player.ONE));
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
        it('should have a bijective encoder', () => {
            NumberEncoderTestUtils.expectToBeBijective(encoder, 0 as number | boolean);
            NumberEncoderTestUtils.expectToBeBijective(encoder, 1 as number | boolean);
            NumberEncoderTestUtils.expectToBeBijective(encoder, 3 as number | boolean);
            NumberEncoderTestUtils.expectToBeBijective(encoder, true as number | boolean);
            NumberEncoderTestUtils.expectToBeBijective(encoder, false as number | boolean);
        });
    });
});
