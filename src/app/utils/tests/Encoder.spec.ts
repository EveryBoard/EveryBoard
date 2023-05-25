/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { comparableEquals } from 'src/app/utils/Comparable';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { AbstractEncoder, Encoder } from '../Encoder';

export class EncoderTestUtils {
    public static expectToBeBijective<T>(encoder: AbstractEncoder<T>, value: T): void {
        const encoded: JSONValue = encoder.encodeValue(value);
        const decoded: T = encoder.decodeValue(encoded);
        expect(comparableEquals(decoded, value)).withContext(`Expected decoded value (${decoded}) to be ${value}`).toBeTrue();
    }
}

describe('MoveEncoder', () => {
    describe('tuple', () => {
        class MyMove extends MoveCoordToCoord {
            public toString(): string {
                return `${this.getStart().toString()} -> ${this.getEnd().toString()}`;
            }
        }
        const myMoveEncoder: Encoder<MyMove> = Encoder.tuple<MyMove, [Coord, Coord]>(
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

        const myComplexMoveEncoder: Encoder<MyComplexMove> =
            Encoder.tuple<MyComplexMove, [Coord, Coord, Coord]>(
                [Coord.encoder, Coord.encoder, Coord.encoder],
                (move: MyComplexMove): [Coord, Coord, Coord] => move.coords,
                (fields: [Coord, Coord, Coord]): MyComplexMove => new MyComplexMove(fields));

        it('should successfully encode and decode', () => {
            EncoderTestUtils.expectToBeBijective(myMoveEncoder, new MyMove(new Coord(0, 0), new Coord(2, 3)));
            EncoderTestUtils.expectToBeBijective(myComplexMoveEncoder, new MyComplexMove(
                [new Coord(0, 0), new Coord(2, 3), new Coord(3, 4)]));
        });
    });
    describe('disjunction', () => {
        const encoder1: AbstractEncoder<number> = Encoder.identity<number>();
        const encoder2: AbstractEncoder<boolean> = Encoder.identity<boolean>();
        const encoder: Encoder<number | boolean> =
            Encoder.disjunction(encoder1,
                                encoder2,
                                (value : number | boolean): value is number => {
                                    return typeof(value) === 'number';
                                });
        it('should have a bijective encoder', () => {
            EncoderTestUtils.expectToBeBijective(encoder, 0 as number | boolean);
            EncoderTestUtils.expectToBeBijective(encoder, 1 as number | boolean);
            EncoderTestUtils.expectToBeBijective(encoder, 3 as number | boolean);
            EncoderTestUtils.expectToBeBijective(encoder, true as number | boolean);
            EncoderTestUtils.expectToBeBijective(encoder, false as number | boolean);
        });
    });
});
