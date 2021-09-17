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
    public equals(o: Move): boolean {
        return false;
    }
}
describe('MoveCoordToCoord', () => {
    it('should throw when created with a null end', () => {
        expect(() => new NonAbstractMoveCoordToCoord(new Coord(0, 0), null)).toThrowError('End cannot be null!');
    });
    describe('getDirection', () => {
        it('should return the direction of the move', () => {
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(0, 1)).getDirection())
                .toEqual(MGPFallible.success(Direction.DOWN));
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(0, -1)).getDirection())
                .toEqual(MGPFallible.success(Direction.UP));
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(1, 0)).getDirection())
                .toEqual(MGPFallible.success(Direction.RIGHT));
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(-1, 0)).getDirection())
                .toEqual(MGPFallible.success(Direction.LEFT));
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(-1, -1)).getDirection())
                .toEqual(MGPFallible.success(Direction.UP_LEFT));
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(-1, 1)).getDirection())
                .toEqual(MGPFallible.success(Direction.DOWN_LEFT));
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(1, -1)).getDirection())
                .toEqual(MGPFallible.success(Direction.UP_RIGHT));
            expect(new NonAbstractMoveCoordToCoord(new Coord(0, 0), new Coord(1, 1)).getDirection())
                .toEqual(MGPFallible.success(Direction.DOWN_RIGHT));
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
