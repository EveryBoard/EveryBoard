/* eslint-disable max-lines-per-function */
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { MGPFallible } from '@everyboard/lib';
import { JSONValue } from '@everyboard/lib';
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

    describe('equals', () => {

        it('should see as equal identical moves', () => {
            // Given two identical moves
            const first: LascaMove = LascaMove.fromStep(new Coord(2, 2), new Coord(3, 3)).get();
            const second: LascaMove = LascaMove.fromStep(new Coord(2, 2), new Coord(3, 3)).get();

            // When comparing them
            // Then the result should be true
            expect(first.equals(second)).toBeTrue();
        });

        it('should see as unequal different moves', () => {
            // Given two different moves
            const first: LascaMove = LascaMove.fromStep(new Coord(2, 2), new Coord(3, 3)).get();
            const second: LascaMove = LascaMove.fromStep(new Coord(0, 4), new Coord(1, 5)).get();

            // When comparing them
            // Then the result should be false
            expect(first.equals(second)).toBeFalse();
        });

    });

    describe('isPrefix', () => {

        it('should see as prefix move that is the same without the ending captures', () => {
            // Given one capture and a second one identical but without the last capture
            const long: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]).get();
            const short: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4)]).get();

            // When calling isPrefix on one and passing the other
            // Then the result should be false
            expect(long.isPrefix(short)).toBeTrue();
            expect(short.isPrefix(long)).toBeTrue();
        });

        it('should not consider equal move as prefix to each others', () => {
            // Given two different moves
            const first: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4)]).get();
            const second: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4)]).get();

            // When calling isPrefix on them
            // Then the result should be false
            expect(first.isPrefix(second)).toBeFalse();
        });

    });

    describe('getStartingCoord', () => {

        it('should return the first coord', () => {
            // Given any move
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4)]).get();

            // When calling getStartingCoord
            const startingCoord: Coord = move.getStartingCoord();

            // Then it should return first coord
            expect(startingCoord.equals(move.coords.get(0))).toBeTrue();
        });

    });

    describe('getEndingCoord', () => {

        it('should return the last coord', () => {
            // Given any move
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4)]).get();

            // When calling getStartingCoord
            const endingCoord: Coord = move.getEndingCoord();

            // Then it should return first coord
            expect(endingCoord.equals(move.coords.get(1))).toBeTrue();
        });

    });

    describe('getCapturedCoords', () => {

        it('should return the coords between move.coords', () => {
            // Given a capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4)]).get();

            // When calling getCapturedCoords
            const steppedOverCoords: Coord[] = move.getCapturedCoords().get().toList();

            // Then the piece should be the stepped over coords
            expect(steppedOverCoords).toEqual([new Coord(3, 3)]);
        });

    });

    describe('concatenate', () => {

        it('should concatenate moves and return a new one', () => {
            // Given two moves, the second starting where the first start
            const first: LascaMove = LascaMove.fromCapture([new Coord(0, 0), new Coord(2, 2)]).get();
            const second: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4)]).get();

            // When concatenating them
            const third: LascaMove = first.concatenate(second);

            // Then the third should have all the coords
            const coords: Coord[] = [
                new Coord(0, 0),
                new Coord(2, 2),
                new Coord(4, 4),
            ];
            const expectedThird: LascaMove = LascaMove.fromCapture(coords).get();
            expect(third.equals(expectedThird)).toBeTrue();
        });

    });

    describe('toString', () => {

        it('should stringify as a coord list', () => {
            // Given any move
            const move: LascaMove = LascaMove.fromCapture([new Coord(0, 0), new Coord(2, 2)]).get();

            // When stringifying it
            const stringification: string = move.toString();

            // Then it should look like this
            expect(stringification).toBe('LascaMove((0, 0), (2, 2))');
        });

    });

});
