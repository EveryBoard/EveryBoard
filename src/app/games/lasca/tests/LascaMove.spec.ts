/* eslint-disable max-lines-per-function */
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { JSONValue } from 'src/app/utils/utils';
import { LascaFailure } from '../LascaFailure';
import { LascaMove } from '../LascaMove';

describe('LascaMove', () => {

    describe('Move', () => {
        it('should forbid vertical move', () => {
            // When trying to create a vertical move
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(0, 0), new Coord(0, 2));

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaFailure.MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL()));
        });
        it('should forbid to start out of the board', () => {
            // When trying to create a move that goes outside of the board
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(-1, 1), new Coord(0, 0));

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(CoordFailure.OUT_OF_RANGE(new Coord(-1, 1))));
        });
        it('should forbid to get out of the board', () => {
            // When trying to create a move that goes outside of the board
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(0, 0), new Coord(-1, 1));

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(CoordFailure.OUT_OF_RANGE(new Coord(-1, 1))));
        });
        it('should forbid too long move', () => {
            // When trying to create a move that does too long step
            const move: MGPFallible<LascaMove> = LascaMove.fromStep(new Coord(0, 0), new Coord(2, 2));

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaFailure.MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL()));
        });
        it('should return a failed fallible for unexisting index getCoord', () => {
            // Given a move with two coords
            const move: LascaMove = LascaMove.fromCapture([new Coord(0, 0), new Coord(2, 2)]).get();

            // When trying to get it's third coord
            const coord: MGPFallible<Coord> = move.getCoord(2);

            // Then it should fail
            expect(coord.getReason()).toBe('invalid index');
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
            expect(move).toEqual(MGPFallible.failure(LascaFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL()));
        });
        it('should forbid to get out of the board', () => {
            // When trying to create a capture that goes outside of the board
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture([new Coord(0, 0), new Coord(-2, 2)]);

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(CoordFailure.OUT_OF_RANGE(new Coord(-2, 2))));
        });
        it('should forbid too long move', () => {
            // When trying to create a capture that does too long step
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture([new Coord(0, 0), new Coord(3, 3)]);

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL()));
        });
        it('should forbid to pass over the same coord several times', () => {
            // When trying to create a capture that passes twice over the same Coord
            const coords: Coord[] = [new Coord(0, 0), new Coord(2, 2), new Coord(0, 0)];
            const move: MGPFallible<LascaMove> = LascaMove.fromCapture(coords);

            // Then it should fail
            expect(move).toEqual(MGPFallible.failure(LascaFailure.CANNOT_CAPTURE_TWICE_THE_SAME_COORD()));
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
