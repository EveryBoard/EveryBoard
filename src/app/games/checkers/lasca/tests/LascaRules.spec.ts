/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersConfig, CheckersNode } from '../../common/AbstractCheckersRules';
import { CheckersFailure } from '../../common/CheckersFailure';
import { CheckersPiece, CheckersStack, CheckersState } from '../../common/CheckersState';
import { LascaRules } from '../LascaRules';

describe('LascaRules', () => {

    const zero: CheckersPiece = CheckersPiece.ZERO;
    const one: CheckersPiece = CheckersPiece.ONE;
    const zeroOfficer: CheckersPiece = CheckersPiece.ZERO_PROMOTED;
    const oneOfficer: CheckersPiece = CheckersPiece.ONE_PROMOTED;

    const __U: CheckersStack = new CheckersStack([zero]);
    const __O: CheckersStack = new CheckersStack([zeroOfficer]);
    const __V: CheckersStack = new CheckersStack([one]);
    const _VU: CheckersStack = new CheckersStack([one, zero]);
    const _UV: CheckersStack = new CheckersStack([zero, one]);
    const _OV: CheckersStack = new CheckersStack([zeroOfficer, one]);
    const __X: CheckersStack = new CheckersStack([oneOfficer]);
    const ___: CheckersStack = CheckersStack.EMPTY;

    let rules: LascaRules;
    const defaultConfig: MGPOptional<CheckersConfig> = LascaRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = LascaRules.get();
    });

    describe('Move', () => {

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
            // Given any board
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, __V, ___, __V, ___, __V],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __U, ___, __U],
                [___, __U, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 0);

            // When doing a move that moves a normal piece backward
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 5), new Coord(2, 6));

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid landing on an occupied square', () => {
            // Given a board where a piece could be tempted to take another's place
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying to land on an occupied square
            const move: CheckersMove = CheckersMove.fromStep(new Coord(5, 5), new Coord(4, 4));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid vertical move', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying to movea piece vertically
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 5), new Coord(1, 3));

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_DO_ORTHOGONAL_MOVE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow simple move', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When doing a simple move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(2, 4), new Coord(3, 3));

            // Then it should succeed
            const expectedState: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, __V, ___, __V, ___, __V],
                [___, ___, ___, __U, ___, ___, ___],
                [__U, ___, ___, ___, __U, ___, __U],
                [___, __U, ___, __U, ___, __U, ___],
                [__U, ___, __U, ___, __U, ___, __U],
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

        it('should forbid long step', () => {
            // Given any board
            const state: CheckersState = CheckersState.of([
                [__V, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, __U],
            ], 0);

            // When trying a move starting outside of the board
            const move: CheckersMove = CheckersMove.fromStep(new Coord(6, 6), new Coord(3, 3));

            // Then it should be illegal
            const reason: string = CheckersFailure.NO_PIECE_CAN_FLY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid jump over allies', () => {
            // Given any board
            const state: CheckersState = CheckersState.of([
                [__V, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, ___, ___],
                [___, ___, ___, ___, __U, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, __O],
            ], 0);

            // When trying a move starting outside of the board
            const move: CheckersMove = CheckersMove.fromStep(new Coord(6, 6), new Coord(2, 2));

            // Then it should be illegal
            const reason: string = CheckersFailure.CANNOT_JUMP_OVER_SEVERAL_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('Capture', () => {

        it('should forbid continuing move after last capture', () => {
            // Given a board with a possible capture
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __U, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 1);

            // When doing a move that jump over an empty square after capture
            const capture: Coord[] = [new Coord(2, 2), new Coord(0, 4), new Coord(2, 6)];
            const move: CheckersMove = CheckersMove.fromCapture(capture).get();

            // Then the move should be illegal
            const reason: string = 'Move cannot continue after non-capture move'; // not doable with UX, so not i18ned
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid to pass out of the board', () => {
            // Given any board
            const state: CheckersState = rules.getInitialState(defaultConfig);

            // When trying a move going outside of the board
            const outOfBoardCoord: Coord = new Coord(8, 4);
            const captures: Coord[] = [new Coord(6, 6), outOfBoardCoord, new Coord(6, 2)];
            const move: CheckersMove = CheckersMove.fromCapture(captures).get();

            // Then it should be illegal
            const reason: string = CoordFailure.OUT_OF_RANGE(outOfBoardCoord);
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid skipping capture', () => {
            // Given a board with a possible capture
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __U, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
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
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, __U, ___, __V, ___, __V],
                [___, __U, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 1);

            // When capturing the first but not the second
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 1), new Coord(3, 3)]).get();

            // Then the move should be illegal
            const reason: string = CheckersFailure.MUST_FINISH_CAPTURING();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid self-capturing', () => {
            // Given a board on which a piece could try to capture its ally
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, __V, ___, ___, ___, ___, ___],
                [___, ___, __V, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __U, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing so
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 1), new Coord(3, 3)]).get();

            // Then the move should be illegal
            const reason: string = RulesFailure.CANNOT_SELF_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid backward capture with normal piece', () => {
            // Given a board on which a normal-piece could try to capture backward
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __U, ___, ___],
                [___, ___, ___, __V, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing so
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(3, 3), new Coord(5, 1)]).get();

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid backward complexe capture', () => {
            // Given a board on which a backward complexe capture is possible
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, __U, ___, __U, ___, __U, ___],
                [__V, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing so
            const captures: Coord[] = [
                new Coord(0, 3),
                new Coord(2, 1),
                new Coord(4, 3),
                new Coord(6, 1),
            ];
            const move: CheckersMove = CheckersMove.fromCapture(captures).get();

            // Then the move should be illegal
            const reason: string = CheckersFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow backward capture with officer', () => {
            // Given a board on which an officer can capture backward
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __V, ___],
                [___, ___, ___, ___, __O, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __V, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 2);

            // When doing it
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(4, 2), new Coord(6, 0)]).get();

            // Then it should be a success
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, _OV],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __V, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 3);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow to do small capture when big capture available', () => {
            // Given a board where two different sized captures are possible
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __V, ___, ___, ___, ___],
                [___, __U, ___, __U, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __U, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the small capture
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, ___, ___],
                [_VU, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __U, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow to do big capture when small capture available', () => {
            // Given a board where two different sized captures are possible
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __V, ___, ___, ___, ___],
                [___, __U, ___, __U, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __U, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the big capture
            const capture: Coord[] = [new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)];
            const move: CheckersMove = CheckersMove.fromCapture(capture).get();

            // Then it should succeed
            const stack: CheckersPiece[] = [CheckersPiece.ONE_PROMOTED, CheckersPiece.ZERO, CheckersPiece.ZERO];
            const Xoo: CheckersStack = new CheckersStack(stack);
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, __U, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, Xoo],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow capturing standalone opponent piece', () => {
            // Given a board with a possible single-capture
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __U, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 1);

            // When capturing the single piece
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, ___, ___, __V, ___, __V],
                [___, ___, ___, ___, ___, ___, ___],
                [_VU, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow capturing commander of an opponent stack', () => {
            // Given a board with a possible stack-capture
            const state: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, __V, ___, __V, ___, __V],
                [___, _UV, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 1);

            // When capturing the commander of the stack
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: CheckersState = CheckersState.of([
                [__V, ___, __V, ___, __V, ___, __V],
                [___, __V, ___, __V, ___, __V, ___],
                [__V, ___, ___, ___, __V, ___, __V],
                [___, __V, ___, ___, ___, ___, ___],
                [_VU, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow multiple-capture', () => {
            // Given a board where a multiple captures is possible
            const state: CheckersState = CheckersState.of([
                [___, ___, __V, ___, ___, ___, ___],
                [___, ___, ___, __U, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __U, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [__U, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the multiple capture
            const move: CheckersMove = CheckersMove.fromCapture([
                new Coord(2, 0),
                new Coord(4, 2),
                new Coord(6, 4)]).get();

            // Then it should succeed
            const vuu: CheckersStack = new CheckersStack([CheckersPiece.ONE, CheckersPiece.ZERO, CheckersPiece.ZERO]);
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, vuu],
                [___, ___, ___, ___, ___, ___, ___],
                [__U, ___, ___, ___, ___, ___, ___],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('Promotion', () => {

        it('should promote the commander of a stack that reached last line', () => {
            // Given a board where a stack is about to reach final line
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, __V, ___, __V],
                [___, _UV, ___, __V, ___, __V, ___],
                [___, ___, __V, ___, __V, ___, __V],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 0);

            // When doing that move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 1), new Coord(0, 0));

            // Then the commander of the stack should be promoted
            const expectedState: CheckersState = CheckersState.of([
                [_OV, ___, ___, ___, __V, ___, __V],
                [___, ___, ___, __V, ___, __V, ___],
                [___, ___, __V, ___, __V, ___, __V],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should promote piece that reached last line', () => {
            // Given a board where a single piece is about to reach final line
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, __V, ___, __V],
                [___, __U, ___, __V, ___, __V, ___],
                [___, ___, __V, ___, __V, ___, __V],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 0);

            // When doing that move
            const move: CheckersMove = CheckersMove.fromStep(new Coord(1, 1), new Coord(0, 0));

            // Then the piece should be promoted
            const expectedState: CheckersState = CheckersState.of([
                [__O, ___, ___, ___, __V, ___, __V],
                [___, ___, ___, __V, ___, __V, ___],
                [___, ___, __V, ___, __V, ___, __V],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __U, ___, __U, ___, __U],
                [___, ___, ___, __U, ___, __U, ___],
                [__U, ___, ___, ___, __U, ___, __U],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('End Game', () => {

        it(`should declare current player winner when opponent has no more commander`, () => {
            // Given a board where Player.ONE have no more commander
            // When evaluating its value
            // Then the current Player.ZERO should win
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [_UV, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);
            const node: CheckersNode = new CheckersNode(expectedState);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it(`should declare current player winner when blocking all opponent's pieces`, () => {
            // Given a board where the last commander(s) of Player.ZERO are stucked
            // When evaluating its value
            // Then the board should be considered as a victory of Player.ONE
            const expectedState: CheckersState = CheckersState.of([
                [__O, ___, __X, ___, ___, ___, ___],
                [___, __X, ___, ___, ___, ___, ___],
                [___, ___, __X, ___, ___, ___, ___],
                [___, ___, ___, __X, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 2);
            const node: CheckersNode = new CheckersNode(expectedState);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

    });

    describe('Custom config', () => {

        it('Should capture instead of stacking when config demands it', () => {
            // Given a board where a kill is possible
            // And a config requesting to do capture instead of kill
            const alternateConfig: MGPOptional<CheckersConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                stackPiece: false,
            });
            const state: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __V, ___, ___, ___, ___],
                [___, __U, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the move
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: CheckersState = CheckersState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [__V, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, alternateConfig);
        });

    });

});
