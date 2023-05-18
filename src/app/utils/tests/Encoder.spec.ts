/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { comparableEquals } from 'src/app/utils/Comparable';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { Encoder, MoveEncoder } from '../Encoder';

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
