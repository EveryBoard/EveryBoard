import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { DraughtMove } from '../DraughtMove';
import { Coord } from "../../../jscaip/Coord";

describe('DraughtMove', () => {
    describe('encoder', () => {
        it('should be bijective', () => {
            // We want to ensure that decoding an encoded move returns the same move.
            // Use `EncoderTestUtils.expectToBeBijective` for this.
            const moves: DraughtMove[] = [
                // Some of your moves
                DraughtMove.fromStep(new Coord(2, 2), new Coord(3,3)).get(),
                DraughtMove.fromCapture([new Coord(1,1), new Coord(3,3)]).get(),
                DraughtMove.fromCapture([new Coord(3,3), new Coord(5,5), new Coord(7,7)]).get()

            ];
            for (const move of moves) {
                EncoderTestUtils.expectToBeBijective(DraughtMove.encoder, move);
            }
        });
    });
    describe('toString', () => {
        it('should stringify as a coord list', () => {
            // Given any move :
            const move: DraughtMove = DraughtMove.fromStep(new Coord(0, 0), new Coord(1,1)).get();

            // Then it should look like this :
            expect(move.toString()).toBe('DraughtMove((0, 0), (1, 1))');
        });
    });
    describe('equals', () => {
        it('should return true for the same move', () => {
            // Given two identical moves :
            const firstMove: DraughtMove = DraughtMove.fromStep(new Coord(1,1), new Coord(2,2)).get();
            const secondMove: DraughtMove = DraughtMove.fromStep(new Coord(1,1), new Coord(2,2)).get();

            // When comparing them
            expect(firstMove.equals(secondMove)).toBeTrue();
        });
        it('should return false for another move', () => {
            // Given two different moves :
            const firstMove: DraughtMove = DraughtMove.fromStep(new Coord(1,1), new Coord(2,2)).get();
            const secondMove: DraughtMove = DraughtMove.fromCapture([new Coord(1,1), new Coord(3,3)]).get();
            expect(firstMove.equals(secondMove)).toBeFalse();
        });
    });
});
