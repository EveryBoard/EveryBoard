import { NumberEncoder } from 'src/app/utils/Encoder';
import { Coord } from '../Coord';
import { MoveCoord, MoveCoordEncoder } from '../MoveCoord';

class MyMoveCoord extends MoveCoord {
    public toString(): string {
        return 'MyMoveCoord';
    }
    public equals(other: MyMoveCoord): boolean {
        throw new Error('Not implemented!');
    }
}

describe('MoveCoordEncoder', () => {
    it('should define the correct maxValue', () => {
        const encoder: NumberEncoder<MyMoveCoord> =
            MoveCoordEncoder.getEncoder(3, 3, (coord: Coord) => new MyMoveCoord(coord.x, coord.y));
        expect(encoder.encodeNumber(new MyMoveCoord(2, 2))).toBe(encoder.maxValue());
    });
});
