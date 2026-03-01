/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { Coord, CoordFailure } from '../../../../jscaip/Coord';
import { Player } from '../../../../jscaip/Player';
import { RulesFailure } from '../../../../jscaip/RulesFailure';
import { RulesUtils } from '../../../../jscaip/tests/RulesUtils.spec';
import { CheckersConfig, CheckersNode } from '../../common/AbstractCheckersRules';
import { CheckersFailure } from '../../common/CheckersFailure';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from '../../common/CheckersState';
import { BashniRules } from '../BashniRules';

describe('BashniRules', () => {

    const zero: CheckersPiece = CheckersPiece.ZERO;
    const one: CheckersPiece = CheckersPiece.ONE;
    const zeroKing: CheckersPiece = CheckersPiece.ZERO_PROMOTED;

    const __U: CheckersStack = new CheckersStack([zero]);
    const __O: CheckersStack = new CheckersStack([zeroKing]);
    const __V: CheckersStack = new CheckersStack([one]);
    const _VU: CheckersStack = new CheckersStack([one, zero]);
    const _UV: CheckersStack = new CheckersStack([zero, one]);
    const ___: CheckersStack = CheckersStack.EMPTY;

    let rules: BashniRules;
    const defaultConfig: MGPOptional<CheckersConfig> = BashniRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = BashniRules.get();
    });

    describe('Step', () => {

        it('should forbid move when first coord is empty', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When doing a move that starts on an empty coord
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 3), new Coord(2, 2));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving opponent piece', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When doing a move that starts on an opponent's piece
            const move: CheckersMove = CheckersMove.fromStep(new Coord(0, 2), new Coord(1, 3));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving normal piece backward', () => {
            // Given a board with normal pieces that could try to go backward
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, ___, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 0);

            // When doing a move that moves a normal piece backward
            const move: CheckersMove = CheckersMove.fromStep(new Coord(3, 5), new Coord(4, 6));

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid landing on an occupied square', () => {
            // Given a board where a piece might try to land on an occupied square
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying to land on an occupied square
            const move: CheckersMove = CheckersMove.fromStep(new Coord(3, 6), new Coord(2, 5));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid vertical move', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying to move a piece vertically
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 6), new Coord(1, 4));

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_MOVE_ORTHOGONALLY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow simple move', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When doing a simple move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(3, 6), new Coord(4, 5));

            // Then the move should succeed
            const expectedState: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __U, ___, ___, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
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
            const outOfBoardCoord: Coord = new Coord(-1, -1);

            // When trying a move going outside of the board
            const move: CheckersMove = CheckersMove.fromStep(new Coord(0, 0), outOfBoardCoord);

            // Then it should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(outOfBoardCoord);
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('Capture', () => {

        it('should forbid skipping capture', () => {
            // Given a board with a possible capture
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __U, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 1);

            // When doing a non capturing move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(2, 2), new Coord(3, 3));

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_SKIP_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid partial-capture', () => {
            // Given a board on which a capture of two pieces is possible
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, __U, ___, __V, ___, __V, ___],
                [___, __U, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 1);

            // When capturing the first but not the second
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 1), new Coord(3, 3)]).get();

            // Then the move should be illegal
            const reason: string = CheckersFailure.MUST_FINISH_CAPTURING();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow backward capture with normal piece', () => {
            // Given a board on which a normal piece can capture backward
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __V, ___, ___, ___],
                [___, ___, ___, __V, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, ___, __U, ___],
                [___, ___, __U, ___, __U, __V, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 0);

            // When doing the backward capture
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(6, 5), new Coord(4, 7)]).get();

            // Then the move should succeed and stack captured piece under the capturing one
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __V, ___, ___, ___],
                [___, ___, ___, __V, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, __U, ___],
                [___, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, _VU, __U, ___, __U],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow small capture when big capture available', () => {
            // Given a board where two different sized captures are possible
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, __V, ___, ___, ___, ___, ___],
                [___, __U, ___, __U, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __U, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the small capture
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then the move should succeed
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, ___, ___, ___],
                [_VU, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __U, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow capturing standalone opponent piece with stacking', () => {
            // Given a board with a possible single-capture
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __U, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 1);

            // When capturing the single piece
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then the move should succeed and stack the captured piece
            const expectedState: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, ___, ___, __V, ___, __V, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [_VU, ___, __U, ___, __U, ___, __U, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow capturing commander of an opponent stack', () => {
            // Given a board with a possible stack-capture
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, _UV, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 1);

            // When capturing the commander of the stack
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then the move should succeed and transfer the stack correctly
            const expectedState: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, ___, ___, __V, ___, __V, ___],
                [___, __V, ___, ___, ___, ___, ___, ___],
                [_VU, ___, __U, ___, __U, ___, __U, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('Promotion', () => {

        it('should promote piece that reached last line', () => {
            // Given a board where a single piece is about to reach final line
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, __V, ___, __V, ___],
                [___, __U, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 0);

            // When doing that move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 1), new Coord(0, 0));

            // Then the piece should be promoted
            const expectedState: CheckersState = CheckersState.of([
                [__O, ___, ___, ___, __V, ___, __V, ___],
                [___, ___, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, __U, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('End Game', () => {

        it('should declare current player winner when opponent commands no more stack', () => {
            // Given a board where Player.ONE has no more commander
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [_UV, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
            ], 1);
            // When evaluating its value
            const node: CheckersNode = new CheckersNode(expectedState);
            // Then the current Player.ZERO should win
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

    });

    describe('Initial state', () => {

        it('should create correct initial state for 8x8 board', () => {
            // Given the default config for Bashni
            const initialState: CheckersState = rules.getInitialState(defaultConfig);

            // Then the initial placement should be correct
            const expectedState: CheckersState = CheckersState.of([
                [___, __V, ___, __V, ___, __V, ___, __V],
                [__V, ___, __V, ___, __V, ___, __V, ___],
                [___, __V, ___, __V, ___, __V, ___, __V],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___, ___],
                [__U, ___, __U, ___, __U, ___, __U, ___],
                [___, __U, ___, __U, ___, __U, ___, __U],
                [__U, ___, __U, ___, __U, ___, __U, ___],
            ], 0);
            expect(initialState).toEqual(expectedState);
        });

    });

});
