/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { comparableEquals, ComparableObject } from 'src/app/utils/Comparable';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { Encoder, MoveEncoder, NumberEncoder } from '../Encoder';

export class EncoderTestUtils {
    public static expectToBeBijective<T>(encoder: Encoder<T>, value: T): void {
        const encoded: JSONValue = encoder.encode(value);
        const decoded: T = encoder.decode(encoded);
        expect(comparableEquals(decoded, value)).withContext(`Expected decoded value (${decoded}) to be ${value}`).toBeTrue();
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
        const encoder: NumberEncoder<T> =
            NumberEncoder.tuple<T, [boolean, number, PlayerOrNone]>(
                [NumberEncoder.booleanEncoder, NumberEncoder.numberEncoder(5), Player.numberEncoder],
                (t: T): [boolean, number, Player] => [t.field1, t.field2, t.field3],
                (fields: [boolean, number, Player]): T => new T(fields[0], fields[1], fields[2]));
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

describe('MoveEncoder', () => {
    describe('tuple', () => {
        class MyMove extends MoveCoordToCoord {
            public toString(): string {
                return `${this.getStart().toString()} -> ${this.getEnd().toString()}`;
            }
            public equals(other: this): boolean {
                return this.getStart().equals(other.getStart()) && this.getEnd().equals(other.getEnd());
            }
        }
        const myMoveEncoder: MoveEncoder<MyMove> = MoveEncoder.tuple<MyMove, [Coord, Coord]>(
            [Coord.encoder, Coord.encoder],
            (move: MyMove): [Coord, Coord] => [move.getStart(), move.getEnd()],
            (fields: [Coord, Coord]): MyMove => new MyMove(fields[0], fields[1]));

        class MyComplexMove extends Move {
            public constructor(public coords: [Coord, Coord, Coord]) {
                Utils.assert(Array.isArray(coords), 'coords should be an array');
                super();
            }
            public toString(): string {
                return 'MyComplexMove';
            }
            public equals(other: this): boolean {
                for (let i: number = 0; i < this.coords.length; i++) {
                    if (this.coords[i].equals(other.coords[i]) === false) {
                        return false;
                    }
                }
                return true;
            }
        }

        const myComplexMoveEncoder: MoveEncoder<MyComplexMove> =
            MoveEncoder.tuple<MyComplexMove, [Coord, Coord, Coord]>(
                [Coord.encoder, Coord.encoder, Coord.encoder],
                (move: MyComplexMove): [Coord, Coord, Coord] => move.coords,
                (fields: [Coord, Coord, Coord]): MyComplexMove => new MyComplexMove(fields));

        it('should successfully encode and decode', () => {
            EncoderTestUtils.expectToBeBijective(myMoveEncoder, new MyMove(new Coord(0, 0), new Coord(2, 3)));
            EncoderTestUtils.expectToBeBijective(myComplexMoveEncoder, new MyComplexMove(
                [new Coord(0, 0), new Coord(2, 3), new Coord(3, 4)]));
        });
    });
});
