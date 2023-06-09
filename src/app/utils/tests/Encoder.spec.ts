/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { comparableEquals } from 'src/app/utils/Comparable';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { Encoder } from '../Encoder';

export class EncoderTestUtils {
    public static expectToBeBijective<T>(encoder: Encoder<T>, value: T): void {
        const encoded: JSONValue = encoder.encode(value);
        const decoded: T = encoder.decode(encoded);
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
        const encoder1: Encoder<number> = Encoder.identity<number>();
        function is1(value : number | boolean): value is number {
            return typeof(value) === 'number';
        }
        const encoder2: Encoder<boolean> = Encoder.identity<boolean>();
        function is2(value : number | boolean): value is boolean {
            return typeof(value) === 'boolean';
        }
        const encoder: Encoder<number | boolean> = Encoder.disjunction([is1, is2], [encoder1, encoder2]);

        it('should have a bijective encoder', () => {
            const disjunctedValues: (number | boolean)[] = [0, 1, 3, true, false];

            for (const disjunctedValue of disjunctedValues) {
                EncoderTestUtils.expectToBeBijective(encoder, disjunctedValue);
            }
        });
    });
});
