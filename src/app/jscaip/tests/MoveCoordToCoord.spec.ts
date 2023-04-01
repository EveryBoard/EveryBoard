/* eslint-disable max-lines-per-function */
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { MoveCoordToCoord } from '../MoveCoordToCoord';

class ConcreteMoveCoordToCoord extends MoveCoordToCoord {
    public toString(): string {
        return 'lel';
    }
    public equals(other: ConcreteMoveCoordToCoord): boolean {
        return this.getStart().equals(other.getStart()) && this.getEnd().equals(other.getEnd());
    }
}
describe('MoveCoordToCoord', () => {
    function myMoveConstructor(start: Coord, end: Coord): MGPFallible<ConcreteMoveCoordToCoord> {
        return MGPFallible.success(new ConcreteMoveCoordToCoord(start, end));
    }

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
        it('should have a bijective encoder', () => {
            EncoderTestUtils.expectToBeBijective(
                ConcreteMoveCoordToCoord.getEncoder(myMoveConstructor),
                new ConcreteMoveCoordToCoord(new Coord(2, 3), new Coord(5, 9)));
        });
        // it('should have a bijective number encoder', () => {
        //     NumberEncoderTestUtils.expectToBeBijective(
        //         ConcreteMoveCoordToCoord.getNumberEncoder(10, 10, myMoveConstructor),
        //         new ConcreteMoveCoordToCoord(new Coord(2, 3), new Coord(5, 9)));
        // });
    });

});
