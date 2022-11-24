/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { JSONValue } from 'src/app/utils/utils';
import { LascaMove, LascaMoveFailure } from '../LascaMove';

fdescribe('LascaMove', () => {

    describe('Move', () => {
        it('should forbid vertical move', () => {
            // When trying to create a vertical move
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(0, 0), new Coord(0, 2));

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaMoveFailure.MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL()));
        });
        it('should forbid to get out of the board', () => {
            // When trying to create a move that goes outside of the board
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(0, 0), new Coord(-1, 1));

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaMoveFailure.CANNOT_LEAVE_THE_BOARD()));
        });
        it('should forbid too long move', () => {
            // When trying to create a move that does too long step
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(0, 0), new Coord(2, 2));

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaMoveFailure.MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL()));
        });
        it('should allow simple move', () => {
            // When trying to create a simple move
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(0, 0), new Coord(1, 1));

            // Then it should succeed
            expect(move.isSuccess()).toBeTrue();
        });
    });
    describe('Capture', () => {
        it('should forbid vertical move', () => {
            // When trying to create a vertical capture
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture([new Coord(0, 0), new Coord(0, 2)]);

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaMoveFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL()));
        });
        it('should forbid to get out of the board', () => {
            // When trying to create a capture that goes outside of the board
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture([new Coord(0, 0), new Coord(-2, 2)]);

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaMoveFailure.CANNOT_LEAVE_THE_BOARD()));
        });
        it('should forbid too long move', () => {
            // When trying to create a capture that does too long step
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture([new Coord(0, 0), new Coord(3, 3)]);

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaMoveFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL()));
        });
        it('should forbid to pass over the same coord several times', () => {
            // When trying to create a capture that passes twice over the same Coord
            const coords: Coord[] = [new Coord(0, 0), new Coord(2, 2), new Coord(0, 0)];
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture(coords);

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaMoveFailure.CANNOT_CAPTURE_TWICE_THE_SAME_COORD()));
        });
        it('should allow simple capture', () => {
            // When trying to create a simple move
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture([new Coord(0, 0), new Coord(2, 2)]);

            // Then it should succeed
            expect(move.isSuccess()).toBeTrue();
        });
    });
    describe('Encoder', () => {
        it('should encode steps', () => {
            // Given a step
            const move: LascaMove = LascaMove.fromStep(new Coord(0, 0), new Coord(1, 1)).get();

            // When encoding it then decoding the result
            const encoded: JSONValue = LascaMove.encoder.encode(move);
            const decoded: LascaMove = LascaMove.encoder.decode(encoded);

            // Then the decoded value should be the original value
            expect(decoded).toEqual(move);
        });
        it('should encode captures', () => {
            // Given a capture
            const steppedCoords: Coord[] = [new Coord(0, 0), new Coord(2, 2), new Coord(0, 4)];
            const move: LascaMove = LascaMove.fromCapture(steppedCoords).get();

            // When encoding it then decoding the result
            const encoded: JSONValue = LascaMove.encoder.encode(move);
            const decoded: LascaMove = LascaMove.encoder.decode(encoded);

            // Then the decoded value should be the original value
            expect(decoded).toEqual(move);
        });
    });
});
