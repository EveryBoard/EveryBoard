import { MoveEncoder } from 'src/app/utils/Encoder';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { Coord } from '../Coord';
import { MoveCoord } from '../MoveCoord';

class MyMoveCoord extends MoveCoord {
    public toString(): string {
        return 'MyMoveCoord';
    }
    public equals(other: MyMoveCoord): boolean {
        return this.coord.equals(other.coord);
    }
}

describe('MoveCoord', () => {
    describe('encoder', () => {
        it('should be bijective', () => {
            const encoder: MoveEncoder<MyMoveCoord> =
                MoveCoord.getEncoder((coord: Coord) => new MyMoveCoord(coord.x, coord.y));
            EncoderTestUtils.expectToBeBijective(encoder, new MyMoveCoord(2, 2));
        });
    });
});
