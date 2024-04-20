/* eslint-disable max-lines-per-function */
import { EncoderTestUtils, TestUtils } from '@everyboard/lib';
import { PylosCoord } from '../PylosCoord';
import { PylosFailure } from '../PylosFailure';
import { PylosMove, PylosMoveFailure } from '../PylosMove';

describe('PylosMove', () => {

    const coord: PylosCoord = new PylosCoord(0, 0, 0);
    const highCoord: PylosCoord = new PylosCoord(0, 0, 2);

    it('should forbid horizontal climb creation', () => {
        // Given two coord on the same Z level
        // When creating a move going horizontally
        function creatingAMoveGoingHorizontally(): void {
            PylosMove.ofClimb(coord, new PylosCoord(1, 1, 0), []);
        }
        // Then it should throw
        const error: string = PylosFailure.MUST_MOVE_UPWARD();
        TestUtils.expectToThrowAndLog(creatingAMoveGoingHorizontally, error);
    });

    it('should allow move creation', () => {
        // From Climb
        expect(PylosMove.ofClimb(coord, highCoord, [])).toBeDefined();

        // From Drop
        expect(PylosMove.ofDrop(coord, [coord])).toBeDefined();
    });

    it('should check and change captures correctly', () => {
        // Check capture
        expect(() => PylosMove.checkCaptures([coord, coord]))
            .toThrowError('PylosMove: should not capture twice same piece.');
        expect(() => PylosMove.checkCaptures([coord, highCoord, coord]))
            .toThrowError(PylosMoveFailure.MUST_CAPTURE_MAXIMUM_TWO_PIECES());
        expect(() => PylosMove.checkCaptures([coord, highCoord])).not.toThrowError();

        // Change capture
        const move: PylosMove = PylosMove.ofDrop(coord, [coord]);
        const otherMove: PylosMove = PylosMove.ofDrop(coord, [highCoord]);
        expect(PylosMove.changeCapture(move, [highCoord])).toEqual(otherMove);
    });

    it('should have a bijective encoder', () => {
        const initialMoves: PylosMove[] = [
            PylosMove.ofClimb(coord, highCoord, []),
            PylosMove.ofClimb(coord, highCoord, [coord]),
            PylosMove.ofClimb(coord, highCoord, [coord, highCoord]),
            PylosMove.ofDrop(coord, []),
            PylosMove.ofDrop(coord, [coord]),
            PylosMove.ofDrop(coord, [highCoord]),
        ];
        for (const move of initialMoves) {
            EncoderTestUtils.expectToBeBijective(PylosMove.encoder, move);
        }
    });

    it('should override toString correctly', () => {
        const lightMove: PylosMove = PylosMove.ofDrop(coord, []);
        const heavyMove: PylosMove = PylosMove.ofClimb(coord, highCoord, [highCoord, coord]);
        expect(lightMove.toString()).toEqual('PylosMove(-, (0, 0, 0), -, -)');
        expect(heavyMove.toString()).toEqual('PylosMove((0, 0, 0), (0, 0, 2), (0, 0, 2), (0, 0, 0))');
    });

    it('should override equals correctly', () => {
        const badCoord: PylosCoord = new PylosCoord(1, 1, 1);
        const move: PylosMove = PylosMove.ofClimb(coord, highCoord, [coord, highCoord]);
        const sameMove: PylosMove = PylosMove.ofClimb(coord, highCoord, [coord, highCoord]);
        const otherMove1: PylosMove = PylosMove.ofClimb(badCoord, highCoord, [coord, highCoord]);
        const otherMove2: PylosMove = PylosMove.ofClimb(coord, badCoord, [coord, highCoord]);
        const otherMove3: PylosMove = PylosMove.ofClimb(coord, highCoord, [badCoord, highCoord]);
        const otherMove4: PylosMove = PylosMove.ofClimb(coord, highCoord, [coord, badCoord]);

        expect(move.equals(move)).toBeTrue();
        expect(move.equals(sameMove)).toBeTrue();
        expect(move.equals(otherMove1)).toBeFalse();
        expect(move.equals(otherMove2)).toBeFalse();
        expect(move.equals(otherMove3)).toBeFalse();
        expect(move.equals(otherMove4)).toBeFalse();
    });

    it('should create [low, high] equal to [high, low]', () => {
        const moveAB: PylosMove = PylosMove.ofClimb(coord, highCoord, [coord, highCoord]);
        expect(moveAB.firstCapture.get()).toEqual(highCoord);
    });

});
