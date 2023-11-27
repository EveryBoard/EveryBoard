import { Encoder } from '@everyboard/lib';
import { EncoderTestUtils } from '@everyboard/lib';
import { Coord } from '../Coord';
import { MoveCoord } from '../MoveCoord';
import { MGPFallible } from '@everyboard/lib';

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
