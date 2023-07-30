import { Encoder } from 'src/app/utils/Encoder';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { Coord } from '../Coord';
import { MoveCoord } from '../MoveCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';

class MyMoveCoord extends MoveCoord {
    public toString(): string {
        return 'MyMoveCoord';
    }
}

describe('MoveCoord', () => {
    describe('encoder', () => {
        it('should be bijective', () => {
            const encoder: Encoder<MyMoveCoord> =
                MoveCoord.getFallibleEncoder((coord: Coord) => MGPFallible.success(new MyMoveCoord(coord.x, coord.y)));
            EncoderTestUtils.expectToBeBijective(encoder, new MyMoveCoord(2, 2));
        });
    });
});
