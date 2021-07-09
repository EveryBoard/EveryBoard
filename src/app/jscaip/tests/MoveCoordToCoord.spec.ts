import { Coord } from '../Coord';
import { Move } from '../Move';
import { MoveCoordToCoord } from '../MoveCoordToCoord';

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
});
