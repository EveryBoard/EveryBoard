/* eslint-disable max-lines-per-function */
import { TestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PentagoMove } from '../PentagoMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';

describe('PentagoMove', () => {

    it('should throw when rotating inexistant block', () => {
        function rotatingNonExistingBlock(): void {
            PentagoMove.withRotation(0, 0, -1, true);
        }
        TestUtils.expectToThrowAndLog(rotatingNonExistingBlock, 'This block does not exist: -1');
    });
    it('should throw when space not in range', () => {
        function usingOutOfRangeCoord(): void {
            PentagoMove.rotationless(-1, 6);
        }
        TestUtils.expectToThrowAndLog(usingOutOfRangeCoord,
                                      'The board is a 6 space wide square, invalid coord: (-1, 6)');
    });
    it('should print nicely', () => {
        let expectedString: string = 'PentagoMove(4, 2)';
        let move: PentagoMove = PentagoMove.rotationless(4, 2);
        expect(move.toString()).toEqual(expectedString);

        expectedString = 'PentagoMove((4, 2), 1, CLOCKWISE)';
        move = PentagoMove.withRotation(4, 2, 1, true);
        expect(move.toString()).toEqual(expectedString);

        expectedString = 'PentagoMove((4, 2), 1, ANTI-CLOCKWISE)';
        move = PentagoMove.withRotation(4, 2, 1, false);
        expect(move.toString()).toEqual(expectedString);
    });
    it('should implements equals correctly', () => {
        const move: PentagoMove = PentagoMove.withRotation(0, 0, 0, false);
        const firstDiff: PentagoMove = PentagoMove.withRotation(1, 1, 0, false);
        const secondDiff: PentagoMove = PentagoMove.withRotation(0, 0, 1, false);
        const thirdDiff: PentagoMove = PentagoMove.withRotation(0, 0, 0, true);
        const noDiff: PentagoMove = PentagoMove.withRotation(0, 0, 0, false);
        expect(move.equals(firstDiff)).toBeFalse();
        expect(move.equals(secondDiff)).toBeFalse();
        expect(move.equals(thirdDiff)).toBeFalse();
        expect(move.equals(noDiff)).toBeTrue();
    });
    it('should translate move correctly', () => {
        const moves: PentagoMove[] = [
            PentagoMove.rotationless(2, 3),
            PentagoMove.withRotation(2, 3, 3, true),
            PentagoMove.withRotation(2, 3, 3, false),
            PentagoMove.withRotation(2, 3, 0, false),
        ];
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(PentagoMove.encoder, move);
        }
    });
});
