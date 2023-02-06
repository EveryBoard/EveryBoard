/* eslint-disable max-lines-per-function */
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { EncoderTestUtils, NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { MoveCoordToCoord } from '../MoveCoordToCoord';

class ConcreteMoveCoordToCoord extends MoveCoordToCoord {
    public toString(): string {
        return 'lel';
    }
    public equals(other: ConcreteMoveCoordToCoord): boolean {
        return this.coord.equals(other.coord) && this.end.equals(other.end);
    }
}
describe('MoveCoordToCoord', () => {

    describe('getDirection', () => {
        it('should return the direction of the move', () => {
            const source: Coord = new Coord(0, 0);
            const allDestsAndDirs: [Coord, Direction][] = [
                [new Coord(0, 1), Direction.DOWN],
                [new Coord(0, -1), Direction.UP],
                [new Coord(1, 0), Direction.RIGHT],
                [new Coord(-1, 0), Direction.LEFT],
                [new Coord(-1, -1), Direction.UP_LEFT],
                [new Coord(-1, 1), Direction.DOWN_LEFT],
                [new Coord(1, -1), Direction.UP_RIGHT],
                [new Coord(1, 1), Direction.DOWN_RIGHT],
            ];
            for (const [destination, direction] of allDestsAndDirs) {
                expect(new ConcreteMoveCoordToCoord(source, destination).getDirection())
                    .toEqual(MGPFallible.success(direction));
            }
        });
    });
    describe('length', () => {
        it('should return the length of the move', () => {
            expect(new ConcreteMoveCoordToCoord(new Coord(0, 0), new Coord(0, 5)).length()).toBe(5);
            expect(new ConcreteMoveCoordToCoord(new Coord(0, 0), new Coord(2, 2)).length()).toBe(2);
        });
    });
    describe('encoder', () => {
        it('should correctly encode and decode moves', () => {
            EncoderTestUtils.expectToBeCorrect(
                ConcreteMoveCoordToCoord.getEncoder((start: Coord, end: Coord): ConcreteMoveCoordToCoord => {
                                                           return new ConcreteMoveCoordToCoord(start, end);
                                                       }),
                new ConcreteMoveCoordToCoord(new Coord(2, 3), new Coord(5, 9)));
        });
    });
    describe('numberEncoder', () => {
        it('should correctly encode and decode moves', () => {
            NumberEncoderTestUtils.expectToBeCorrect(
                ConcreteMoveCoordToCoord.getNumberEncoder(10, 10,
                                                             (start: Coord, end: Coord):
                                                             ConcreteMoveCoordToCoord =>
                                                             {
                                                                 return new ConcreteMoveCoordToCoord(start, end);
                                                             }),
                new ConcreteMoveCoordToCoord(new Coord(2, 3), new Coord(5, 9)));
        });
    });

});
