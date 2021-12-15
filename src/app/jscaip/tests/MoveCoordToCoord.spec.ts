import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Move } from '../Move';
import { MoveCoordToCoord } from '../MoveCoordToCoord';
import { NumberEncoderTestUtils } from './Encoder.spec';

class NonAbstractMoveCoordToCoord extends MoveCoordToCoord {
    public toString(): string {
        return 'lel';
    }
    public equals(_: Move): boolean {
        return false;
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
                expect(new NonAbstractMoveCoordToCoord(source, destination).getDirection())
                    .toEqual(MGPFallible.success(direction));
            }
        });
    });
    describe('length', () => {
        it('should return the length of the move', () => {
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(0, 5)).length()).toBe(5);
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(2, 2)).length()).toBe(2);
        });
    });
    describe('encoder', () => {
        it('should correctly encode and decode moves', () => {
            NumberEncoderTestUtils.expectToBeCorrect(
                NonAbstractMoveCoordToCoord.getEncoder(10, 10,
                                                       (start: Coord, end: Coord): NonAbstractMoveCoordToCoord => {
                                                           return new NonAbstractMoveCoordToCoord(start, end);
                                                       }),
                new NonAbstractMoveCoordToCoord(new Coord(2, 3), new Coord(5, 9)));
        });
    });
});
