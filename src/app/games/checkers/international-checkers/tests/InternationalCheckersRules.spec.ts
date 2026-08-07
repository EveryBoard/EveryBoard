/* eslint-disable max-lines-per-function */
import { Coord, CoordFailure } from '../../../../jscaip/Coord';
import { Player } from '../../../../jscaip/Player';
import { RulesFailure } from '../../../../jscaip/RulesFailure';
import { RulesUtils } from '../../../../jscaip/tests/RulesUtils.spec';
import { CheckersConfig, CheckersNode } from '../../common/AbstractCheckersRules';
import { CheckersFailure } from '../../common/CheckersFailure';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState, EvenCheckersState, OddCheckersState } from '../../common/CheckersState';
import { InternationalCheckersRules } from '../InternationalCheckersRules';

// If you modify this rule file, modify the other checkers rules tests
describe('InternationalCheckersRules', () => {

    const zero: CheckersPiece = CheckersPiece.ZERO;
    const one: CheckersPiece = CheckersPiece.ONE;
    const zeroKing: CheckersPiece = CheckersPiece.ZERO_PROMOTED;
    const oneKing: CheckersPiece = CheckersPiece.ONE_PROMOTED;

    const U: CheckersStack = new CheckersStack([zero]);
    const O: CheckersStack = new CheckersStack([zeroKing]);
    const V: CheckersStack = new CheckersStack([one]);
    const X: CheckersStack = new CheckersStack([oneKing]);
    const _: CheckersStack = CheckersStack.EMPTY;

    let rules: InternationalCheckersRules;
    const defaultConfig: CheckersConfig = InternationalCheckersRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = InternationalCheckersRules.get();
    });

    describe('Step', () => {

        it('should forbid move when first coord is empty', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When doing a move that starts on an empty coord
            const move: CheckersMove = CheckersMove.fromStep(new Coord(4, 5), new Coord(3, 4));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving opponent piece', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When doing a move that starts on an opponent's piece
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 2), new Coord(2, 3));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving normal piece backward', () => {
            // Given any board
            const state: CheckersState = OddCheckersState.of([
                [_, V, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 0);

            // When doing a move that moves a normal piece backward
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 4), new Coord(2, 5));

            // Then the move should be illegal
            const reason: string = CheckersFailure.ONLY_PROMOTED_PIECES_CAN_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid landing on an occupied square', () => {
            // Given a board where a piece could be tempted to take another's place
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying to land on an occupied square
            const move: CheckersMove = CheckersMove.fromStep(new Coord(6, 7), new Coord(5, 6));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid vertical move', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying to move a piece vertically
            const move: CheckersMove = CheckersMove.fromStep(new Coord(5, 6), new Coord(5, 4));

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_MOVE_ORTHOGONALLY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow simple move', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When doing a simple move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(5, 6), new Coord(4, 5));

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, V, _, V, _, V, _, V, _, V],
                [V, _, V, _, V, _, V, _, V, _],
                [_, V, _, V, _, V, _, V, _, V],
                [V, _, V, _, V, _, V, _, V, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, U, _, _, _, _, _],
                [_, U, _, U, _, _, _, U, _, U],
                [U, _, U, _, U, _, U, _, U, _],
                [_, U, _, U, _, U, _, U, _, U],
                [U, _, U, _, U, _, U, _, U, _],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid to start out of the board', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying a move starting outside of the board
            const move: CheckersMove = CheckersMove.fromStep(new Coord(-1, 1), new Coord(0, 0));

            // Then it should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(new Coord(-1, 1));
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid to get out of the board', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying a move going outside of the board
            const outOfBoardCoord: Coord = new Coord(-1, -1);
            const move: CheckersMove = CheckersMove.fromStep(new Coord(0, 0), outOfBoardCoord);

            // Then it should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(outOfBoardCoord);
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid long step for normal piece', () => {
            // Given any board
            const state: CheckersState = OddCheckersState.of([
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, U],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);

            // When trying to make a long step with a normal piece
            const move: CheckersMove = CheckersMove.fromStep(new Coord(9, 8), new Coord(3, 2));

            // Then it should be illegal
            const reason: string = CheckersFailure.NORMAL_PIECES_CANNOT_MOVE_LIKE_THIS();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow long step forward for king', () => {
            // Given any board with a king
            const state: CheckersState = OddCheckersState.of([
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);

            // When doing a simple move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(9, 8), new Coord(3, 2));

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow long backward step for king', () => {
            // Given any board with a king
            const state: CheckersState = OddCheckersState.of([
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, O, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);

            // When doing a simple move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(8, 1), new Coord(5, 4));

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, O, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should forbid jumping over multiple pieces', () => {
            // Given a board with a possible jump over two pieces
            const state: CheckersState = OddCheckersState.of([
                [_, V, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, V, _, _, _],
                [_, _, _, _, V, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, O],
                [_, _, _, _, _, _, _],
            ], 0);

            // When trying to capture two pieces in one jump
            const move: CheckersMove = CheckersMove.fromStep(new Coord(6, 5), new Coord(2, 1));

            // Then it should be illegal
            const reason: string = CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('Capture', () => {

        describe('Normal Pieces', () => {

            it('should forbid continuing move after last capture', () => {
                // Given a board with a possible capture
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [V, _, V, _, V, _, V, _, _, _],
                    [_, V, _, V, _, V, _, _, _, _],
                    [V, _, V, _, V, _, V, _, _, _],
                    [_, U, _, _, _, _, _, _, _, _],
                    [_, _, U, _, U, _, U, _, _, _],
                    [_, _, _, U, _, U, _, _, _, _],
                    [U, _, _, _, U, _, U, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);

                // When doing a move that jump over an empty square after capture
                const capture: Coord[] = [new Coord(2, 3), new Coord(0, 5), new Coord(2, 7)];
                const move: CheckersMove = CheckersMove.fromCapture(capture);

                // Then the move should be illegal
                const reason: string = CheckersFailure.MOVE_CANNOT_CONTINUE_AFTER_NON_CAPTURE_MOVE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid to go out of the board mid-capture', () => {
                // Given any board
                const state: CheckersState = rules.getInitialState(defaultConfig);

                // When trying a move going outside of the board
                const outOfBoardCoord: Coord = new Coord(-2, 4);
                const captures: Coord[] = [new Coord(0, 6), outOfBoardCoord, new Coord(0, 2)];
                const move: CheckersMove = CheckersMove.fromCapture(captures);

                // Then it should be illegal
                const reason: string = CoordFailure.OUT_OF_RANGE(outOfBoardCoord);
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid skipping capture', () => {
                // Given a board with a possible capture
                const state: CheckersState = OddCheckersState.of([
                    [_, V, _, V, _, V, _],
                    [_, _, V, _, V, _, V],
                    [_, V, _, V, _, V, _],
                    [_, _, U, _, _, _, _],
                    [_, _, _, U, _, U, _],
                    [_, _, _, _, U, _, U],
                    [_, U, _, _, _, U, _],
                ], 1);

                // When doing a non capturing move
                const move: CheckersMove = CheckersMove.fromStep(new Coord(3, 2), new Coord(4, 3));

                // Then the move should be illegal
                const reason: string = CheckersFailure.CANNOT_SKIP_CAPTURE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid partial-capture', () => {
                // Given a board on which a capture of two pieces is possible
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [V, _, V, _, V, _, V, _, _, _],
                    [_, V, _, V, _, V, _, _, _, _],
                    [V, _, U, _, V, _, V, _, _, _],
                    [_, U, _, _, _, _, _, _, _, _],
                    [_, _, U, _, U, _, U, _, _, _],
                    [_, _, _, U, _, U, _, _, _, _],
                    [U, _, _, _, U, _, U, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);

                // When capturing the first but not the second
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 2), new Coord(3, 4)]);

                // Then the move should be illegal
                const reason: string = CheckersFailure.MUST_FINISH_CAPTURING();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid self-capturing', () => {
                // Given a board on which a piece could try to capture its ally
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, V, _, _, _, _, _],
                    [_, _, V, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, U, _],
                ], 1);

                // When doing so
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 2), new Coord(3, 4)]);

                // Then the move should be illegal
                const reason: string = RulesFailure.CANNOT_SELF_CAPTURE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid to do small capture when big capture available', () => {
                // Given a board where two different sized captures are possible
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _],
                    [_, _, V, _, _, _, _],
                    [_, U, _, U, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, U, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                ], 1);

                // When doing the small capture
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 1), new Coord(0, 3)]);

                // Then it should be illegal
                const reason: string = CheckersFailure.MUST_DO_LONGEST_CAPTURE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid long capture for normal piece', () => {
                // Given a board where a normal piece could try a capture with a longer jump
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, V, _, _, _, _, _, _, _],
                    [_, _, _, U, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, U, _, _, _, _],
                    [_, _, V, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [U, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 0);

                // When trying to do a capture that does too long step
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(0, 7), new Coord(3, 4)]);

                // Then it should fail
                const reason: string = CheckersFailure.FLYING_CAPTURE_IS_FORBIDDEN_FOR_NORMAL_PIECES();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should allow backward simple capture', () => {
                // Given a board on which a backward capture is possible
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, U, _, _, _, _, _],
                    [_, _, _, V, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);

                // When doing so
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(3, 4), new Coord(5, 2)]);

                // Then the piece should be captured
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, V, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 2);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should allow backward complex capture', () => {
                // Given a board on which a backward complex capture is possible
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, U, _, U, _, U, _],
                    [_, _, _, V, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);

                // When doing so
                const captures: Coord[] = [
                    new Coord(3, 4),
                    new Coord(5, 2),
                    new Coord(7, 4),
                    new Coord(9, 2),
                ];
                const move: CheckersMove = CheckersMove.fromCapture(captures);

                // Then the piece should be captured
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, V],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 2);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should allow to do big capture when small capture available', () => {
                // Given a board where two different sized captures are possible
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, V, _, _, _, _],
                    [_, _, _, _, U, _, U, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, U, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);

                // When doing the big capture
                const capture: Coord[] = [new Coord(5, 4), new Coord(7, 6), new Coord(9, 8)];
                const move: CheckersMove = CheckersMove.fromCapture(capture);

                // Then the move should succeed
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, U, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, V],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 2);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should allow capturing standalone opponent piece', () => {
                // Given a board with a possible single-capture
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, V, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, V, _, _, _, _, _],
                    [_, _, _, _, _, U, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 2);

                // When capturing the single piece
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(5, 6), new Coord(3, 4)]);

                // Then the move should succeed
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, V, _, _, _],
                    [_, _, _, U, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 3);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should allow multiple-capture', () => {
                // Given a board where a multiple captures is possible
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, V, _, _, _, _, _, _, _],
                    [_, _, _, U, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, U, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [U, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);

                // When doing the multiple capture
                const move: CheckersMove = CheckersMove.fromCapture([
                    new Coord(2, 1),
                    new Coord(4, 3),
                    new Coord(6, 5),
                ]);

                // Then the move should succeed
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, V, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [U, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 2);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

        });

        describe('King', () => {

            it('should allow backward capture with king', () => {
                // Given a board on which an king can capture backward
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, V, _],
                    [_, _, _, _, O, _, _],
                    [_, V, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                ], 2);

                // When doing it
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(4, 3), new Coord(6, 1)]);

                // Then the move should succeed
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, O],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, V, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                ], 3);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should forbid capturing two allies in one jump', () => {
                // Given a board where a double capture would be possible
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [V, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, U, _, _, _],
                    [_, _, _, _, _, _, _, U, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 0);

                // When trying to capture two pieces in one jump
                const move: CheckersMove = CheckersMove.fromStep(new Coord(9, 8), new Coord(3, 2));

                // Then it should be illegal
                const reason: string = CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid capturing two ennemies in one jump', () => {
                // Given any board
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [V, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, V, _, _, _],
                    [_, _, _, _, _, _, _, V, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, O],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 0);

                // When trying to capture two pieces in one jump
                const move: CheckersMove = CheckersMove.fromStep(new Coord(9, 8), new Coord(3, 2));

                // Then it should be illegal
                const reason: string = CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should allow king capture to land just after capture', () => {
                // Given a board where a king could capture with a longer jump
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, U, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, U, _, _, _, _],
                    [_, _, V, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, V],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 0);

                // When trying to do a capture with "right after" landing
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(0, 7), new Coord(3, 4)]);

                // Then the move should succeed
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, U, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, O, _, U, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, V],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should allow king capture to land far after capture', () => {
                // Given a board where a king could capture with a longer jump
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, U, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, U, _, _, _, _],
                    [_, _, V, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, V],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 0);

                // When trying to do a capture with a "further" landing
                const move: CheckersMove = CheckersMove.fromCapture([new Coord(0, 7), new Coord(4, 3)]);

                // Then the move should succeed
                const expectedState: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, U, _, _, _, _, _, _],
                    [_, _, _, _, O, _, _, _, _, _],
                    [_, _, _, _, _, U, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, V],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 1);
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
            });

            it('should forbid king to capture the same piece twice', () => {
                // Given a board where a king could capture with a longer jump
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, V, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, V, _, _, _, _],
                    [_, _, V, _, _, _, _, _, _, _],
                    [_, _, _, _, _, V, _, _, _, _],
                    [O, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, V],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 0);

                // When capturing twice the same piece (reminder: pieces are only removed *after* the capture)
                const move: CheckersMove = CheckersMove.fromCapture([
                    new Coord(0, 7), new Coord(4, 3), new Coord(6, 5),
                    new Coord(4, 7), new Coord(1, 4),
                ]);

                // Then it should be illegal
                const reason: string = CheckersFailure.CANNOT_CAPTURE_TWICE_THE_SAME_SQUARE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

            it('should forbid landing on a square that had a piece captured in the same move', () => {
                // Given a board where a king could capture and land on a square that had a piece
                const state: CheckersState = OddCheckersState.of([
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, V, _, _, _, _],
                    [_, _, _, _, _, _, V, _, V, _],
                    [_, _, _, _, _, _, _, _, _, O],
                    [_, _, _, _, V, _, V, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _, _, _, _],
                ], 0);

                // When capturing and trying to land on (5, 5) which has a captured piece
                const move: CheckersMove = CheckersMove.fromCapture([
                    new Coord(9, 6), new Coord(6, 3), new Coord(3, 6),
                    new Coord(5, 8), new Coord(7, 6), new Coord(5, 4),
                ]);

                // Then it should be illegal
                const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            });

        });

    });

    describe('Promotion', () => {

        it('should promote piece that reached last line', () => {
            // Given a board where a single piece is about to reach final line
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, U, _, _, _, _],
                [_, _, _, _, _, V, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 0);

            // When doing that move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(2, 1), new Coord(1, 0));

            // Then the piece should be promoted
            const expectedState: CheckersState = OddCheckersState.of([
                [_, O, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, V, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should not promote piece that reached last line but came back to capture', () => {
            // Given a board where a single piece is about to reach final line then go backward
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, V, _, _],
                [_, _, V, _, V, _, V, _, _, _],
                [_, U, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, V, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);

            // When doing that move
            const captures: Coord[] = [new Coord(1, 2), new Coord(3, 0), new Coord(5, 2)];
            const move: CheckersMove = CheckersMove.fromCapture(captures);

            // Then the piece should be promoted
            const expectedState: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, V, _, _],
                [_, _, _, _, _, _, V, _, _, _],
                [_, _, _, _, _, U, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, V, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('End Game', () => {

        it(`should declare current player winner when opponent has no more pieces`, () => {
            // Given a board where Player.ONE have no more piece
            const expectedState: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [O, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 1);
            const node: CheckersNode = new CheckersNode(expectedState);

            // When checking the game status
            // Then it should be a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it(`should declare current player winner when blocking all opponent's pieces`, () => {
            // Given a board where the last commander(s) of Player.ZERO are stucked
            // when checking the game status
            // Then the board should be considered as a victory of Player.ONE
            const expectedState: CheckersState = OddCheckersState.of([
                [_, X, _, _, _, _, _],
                [O, _, _, _, _, _, _],
                [_, X, _, _, _, _, _],
                [_, _, X, _, _, _, _],
                [_, _, _, X, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);
            const node: CheckersNode = new CheckersNode(expectedState);

            // When checking the game status
            // Then it should be a victory for Player.ONE
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

    });

    describe('Custom config', () => {

        it('Should stack instead of capturing when config demands it', () => {
            // Given a board where a killing capture is possible
            // And a config requesting to do stack captures instead of killing captures
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                canStackPieces: false,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, V, _, _, _, _],
                [_, U, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 1);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 3), new Coord(0, 5)]);

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [V, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

        it('should put piece on even squares if config requires it', () => {
            // Given a customConfig where piece are to be put on even squares
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                occupyEvenSquare: true,
            };

            // When generating it
            const initialState: CheckersState = rules.getInitialState(customConfig);

            // Then it should be correct
            const expectedState: CheckersState = EvenCheckersState.of([
                [V, _, V, _, V, _, V, _, V, _],
                [_, V, _, V, _, V, _, V, _, V],
                [V, _, V, _, V, _, V, _, V, _],
                [_, V, _, V, _, V, _, V, _, V],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [U, _, U, _, U, _, U, _, U, _],
                [_, U, _, U, _, U, _, U, _, U],
                [U, _, U, _, U, _, U, _, U, _],
                [_, U, _, U, _, U, _, U, _, U],
            ], 0);
            expect(initialState).toEqual(expectedState);
        });

        it('Should allow forward frisian-capture when config allows it', () => {
            // Given a board where a frisian capture is possible
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, V, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, U, _, _, _],
            ], 2);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(3, 6), new Coord(3, 2)]);

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, U, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 3);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

        it('Should allow lateral frisian-capture when config allows it', () => {
            // Given a board where a frisian capture is possible
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, V, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 4), new Coord(5, 4)]);

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, U, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 3);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

        it('Should allow backward frisian-capture when config allows it', () => {
            // Given a board where a frisian capture is possible
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
                simplePieceCanCaptureBackwards: true,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, U, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, V, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(3, 2), new Coord(3, 6)]);

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, U, _, _, _],
            ], 3);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

        it('Should refuse frisian-step even if config allows frisian capture', () => {
            // Given a board where a frisian capture is possible
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, V, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 4), new Coord(3, 4)]);

            // Then it should fail
            const reason: string = CheckersFailure.INVALID_FRISIAN_MOVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
        });

        it('Should refuse a uneven frisian capture even if config allows frisian capture', () => {
            // Given a board where a frisian capture is possible
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, V, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, V, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 4), new Coord(4, 4)]);

            // Then it should fail
            const reason: string = CheckersFailure.FRISIAN_CAPTURE_MUST_BE_EVEN();
            RulesUtils.expectMoveFailure(rules, state, move, reason, customConfig);
        });

        it('Should allow flying-frisian when config allows it', () => {
            // Given a board where a frisian capture is possible
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
                promotedPiecesCanFly: true,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, O, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, V, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 0), new Coord(1, 6)]);

            // Then the move should succeed
            const expectedState: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, O, _, _, _, _, _],
            ], 3);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, customConfig);
        });

    });

});
