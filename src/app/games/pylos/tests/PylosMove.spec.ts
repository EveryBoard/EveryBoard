/* eslint-disable max-lines-per-function */
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { PylosCoord } from '../PylosCoord';
import { PylosFailure } from '../PylosFailure';
import { PylosMove, PylosMoveFailure } from '../PylosMove';

describe('PylosMove', () => {

    const coord: PylosCoord = new PylosCoord(0, 0, 0);
    const highCoord: PylosCoord = new PylosCoord(0, 0, 2);

    it('should forbid horizontal climb creation', () => {
        // Given two coord on the same Z level
        // When creating a move going horizontally
        // Then it should throw
        expect(() => PylosMove.fromClimb(coord, new PylosCoord(1, 1, 0), []))
            .toThrowError(PylosFailure.MUST_MOVE_UPWARD());
    });
    it('should allow move creation', () => {
        // From Climb
        expect(PylosMove.fromClimb(coord, highCoord, [])).toBeDefined();

        // From Drop
        expect(PylosMove.fromDrop(coord, [coord])).toBeDefined();
    });
    it('should check and change captures correctly', () => {
        // Check capture
        expect(() => PylosMove.checkCaptures([coord, coord]))
            .toThrowError('PylosMove: should not capture twice same piece.');
        expect(() => PylosMove.checkCaptures([coord, highCoord, coord]))
            .toThrowError(PylosMoveFailure.MUST_CAPTURE_MAXIMUM_TWO_PIECES());
        expect(() => PylosMove.checkCaptures([coord, highCoord])).not.toThrowError();

        // Change capture
        const move: PylosMove = PylosMove.fromDrop(coord, [coord]);
        const otherMove: PylosMove = PylosMove.fromDrop(coord, [highCoord]);
        expect(PylosMove.changeCapture(move, [highCoord])).toEqual(otherMove);
    });
    it('should have a bijective encoder', () => {
        const initialMoves: PylosMove[] = [
            PylosMove.fromClimb(coord, highCoord, []),
            PylosMove.fromClimb(coord, highCoord, [coord]),
            PylosMove.fromClimb(coord, highCoord, [coord, highCoord]),
            PylosMove.fromDrop(coord, []),
            PylosMove.fromDrop(coord, [coord]),
            PylosMove.fromDrop(coord, [highCoord]),
        ];
        for (const move of initialMoves) {
            EncoderTestUtils.expectToBeBijective(PylosMove.encoder, move);
        }
    });
    it('should override toString correctly', () => {
        const lightMove: PylosMove = PylosMove.fromDrop(coord, []);
        const heavyMove: PylosMove = PylosMove.fromClimb(coord, highCoord, [highCoord, coord]);
        expect(lightMove.toString()).toEqual('PylosMove(-, (0, 0, 0), -, -)');
        expect(heavyMove.toString()).toEqual('PylosMove((0, 0, 0), (0, 0, 2), (0, 0, 2), (0, 0, 0))');
    });
    it('should override equals correctly', () => {
        const badCoord: PylosCoord = new PylosCoord(1, 1, 1);
        const move: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, highCoord]);
        const sameMove: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, highCoord]);
        const otherMove1: PylosMove = PylosMove.fromClimb(badCoord, highCoord, [coord, highCoord]);
        const otherMove2: PylosMove = PylosMove.fromClimb(coord, badCoord, [coord, highCoord]);
        const otherMove3: PylosMove = PylosMove.fromClimb(coord, highCoord, [badCoord, highCoord]);
        const otherMove4: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, badCoord]);

        expect(move.equals(move)).toBeTrue();
        expect(move.equals(sameMove)).toBeTrue();
        expect(move.equals(otherMove1)).toBeFalse();
        expect(move.equals(otherMove2)).toBeFalse();
        expect(move.equals(otherMove3)).toBeFalse();
        expect(move.equals(otherMove4)).toBeFalse();
    });
    it('should create [low, high] equal to [high, low]', () => {
        const moveAB: PylosMove = PylosMove.fromClimb(coord, highCoord, [coord, highCoord]);
        expect(moveAB.firstCapture.get()).toEqual(highCoord);
    });
});
