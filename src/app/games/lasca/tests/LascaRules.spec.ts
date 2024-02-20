/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { LascaMove } from '../LascaMove';
import { LascaNode, LascaRules } from '../LascaRules';
import { LascaFailure } from '../LascaFailure';
import { LascaPiece, LascaStack, LascaState } from '../LascaState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('LascaRules', () => {

    const zero: LascaPiece = LascaPiece.ZERO;
    const one: LascaPiece = LascaPiece.ONE;
    const zeroOfficer: LascaPiece = LascaPiece.ZERO_OFFICER;
    const oneOfficer: LascaPiece = LascaPiece.ONE_OFFICER;

    const __u: LascaStack = new LascaStack([zero]);
    const __O: LascaStack = new LascaStack([zeroOfficer]);
    const __v: LascaStack = new LascaStack([one]);
    const _vu: LascaStack = new LascaStack([one, zero]);
    const _uv: LascaStack = new LascaStack([zero, one]);
    const _Ov: LascaStack = new LascaStack([zeroOfficer, one]);
    const __X: LascaStack = new LascaStack([oneOfficer]);
    const ___: LascaStack = LascaStack.EMPTY;

    let rules: LascaRules;
    const defaultConfig: NoConfig = LascaRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = LascaRules.get();
    });

    describe('Move', () => {

        it('should forbid move when first coord is empty', () => {
            // Given any board
            const state: LascaState = LascaRules.get().getInitialState();

            // When doing a move that starts on an empty coord
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 3), new Coord(2, 2)).get();

            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving opponent piece', () => {
            // Given any board
            const state: LascaState = LascaRules.get().getInitialState();

            // When doing a move that starts on an opponent's piece
            const move: LascaMove = LascaMove.fromStep(new Coord(0, 2), new Coord(1, 3)).get();

            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving normal piece backward', () => {
            // Given any board
            const state: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, __v, ___, __v, ___, __v],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __u, ___, __u],
                [___, __u, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 0);

            // When doing a move that moves a normal piece backward
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 5), new Coord(2, 6)).get();

            // Then it should fail
            const reason: string = LascaFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid landing on an occupied square', () => {
            // Given a board where a piece could be tempted to take another's place
            const state: LascaState = LascaRules.get().getInitialState();

            // When trying to land on an occupied square
            const move: LascaMove = LascaMove.fromStep(new Coord(5, 5), new Coord(4, 4)).get();

            // Then it should fail
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow simple move', () => {
            // Given any board
            const state: LascaState = LascaRules.get().getInitialState();

            // When doing a simple move
            const move: LascaMove = LascaMove.fromStep(new Coord(2, 4), new Coord(3, 3)).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, __v, ___, __v, ___, __v],
                [___, ___, ___, __u, ___, ___, ___],
                [__u, ___, ___, ___, __u, ___, __u],
                [___, __u, ___, __u, ___, __u, ___],
                [__u, ___, __u, ___, __u, ___, __u],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('Capture', () => {

        it('should forbid continuing move after last capture', () => {
            // Given a board with a possible capture
            const state: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __u, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 1);

            // When doing a move that jump over an empty square after capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4), new Coord(2, 6)]).get();

            // Then it should fail
            const reason: string = LascaFailure.CANNOT_CAPTURE_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid skipping capture', () => {
            // Given a board with a possible capture
            const state: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __u, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 1);

            // When doing a non capturing move
            const move: LascaMove = LascaMove.fromStep(new Coord(2, 2), new Coord(3, 3)).get();

            // Then it should fail
            const reason: string = LascaFailure.CANNOT_SKIP_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid partial-capture', () => {
            // Given a board on which a capture of two pieces is possible
            const state: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, __u, ___, __v, ___, __v],
                [___, __u, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 1);

            // When capturing the first but not the second
            const move: LascaMove = LascaMove.fromCapture([new Coord(1, 1), new Coord(3, 3)]).get();

            // Then it should fail
            const reason: string = LascaFailure.MUST_FINISH_CAPTURING();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid self-capturing', () => {
            // Given a board on which a piece could try to capture its ally
            const state: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, __v, ___, ___, ___, ___, ___],
                [___, ___, __v, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __u, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing so
            const move: LascaMove = LascaMove.fromCapture([new Coord(1, 1), new Coord(3, 3)]).get();

            // Then it should fail
            const reason: string = RulesFailure.CANNOT_SELF_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid backward capture with normal piece', () => {
            // Given a board on which a normal-piece could try to capture backward
            const state: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, __u, ___, ___],
                [___, ___, ___, __v, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing so
            const move: LascaMove = LascaMove.fromCapture([new Coord(3, 3), new Coord(5, 1)]).get();

            // Then it should fail
            const reason: string = LascaFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow backward capture with officer', () => {
            // Given a board on which an officer can capture backward
            const state: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __v, ___],
                [___, ___, ___, ___, __O, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __v, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 2);

            // When doing it
            const move: LascaMove = LascaMove.fromCapture([new Coord(4, 2), new Coord(6, 0)]).get();

            // Then it should be a success
            const expectedState: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, _Ov],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __v, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 3);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow to do small capture when big capture available', () => {
            // Given a board where two different sized captures are possible
            const state: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __v, ___, ___, ___, ___],
                [___, __u, ___, __u, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __u, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the small capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, __u, ___, ___, ___],
                [_vu, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __u, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow to do big capture when small capture available', () => {
            // Given a board where two different sized captures are possible
            const state: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __v, ___, ___, ___, ___],
                [___, __u, ___, __u, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __u, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the big capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]).get();

            // Then it should succeed
            const Xoo: LascaStack = new LascaStack([LascaPiece.ONE_OFFICER, LascaPiece.ZERO, LascaPiece.ZERO]);
            const expectedState: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, __u, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, Xoo],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow capturing standalone opponent piece', () => {
            // Given a board with a possible single-capture
            const state: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __u, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 1);

            // When capturing the single piece
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, ___, ___, __v, ___, __v],
                [___, ___, ___, ___, ___, ___, ___],
                [_vu, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow capturing commander of an opponent stack', () => {
            // Given a board with a possible stack-capture
            const state: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, __v, ___, __v, ___, __v],
                [___, _uv, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 1);

            // When capturing the commander of the stack
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.of([
                [__v, ___, __v, ___, __v, ___, __v],
                [___, __v, ___, __v, ___, __v, ___],
                [__v, ___, ___, ___, __v, ___, __v],
                [___, __v, ___, ___, ___, ___, ___],
                [_vu, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow multiple-capture', () => {
            // Given a board where a multiple captures is possible
            const state: LascaState = LascaState.of([
                [___, ___, __v, ___, ___, ___, ___],
                [___, ___, ___, __u, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, __u, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [__u, ___, ___, ___, ___, ___, ___],
            ], 1);

            // When doing the multiple capture
            const move: LascaMove = LascaMove.fromCapture([
                new Coord(2, 0),
                new Coord(4, 2),
                new Coord(6, 4)]).get();

            // Then it should succeed
            const vuu: LascaStack = new LascaStack([LascaPiece.ONE, LascaPiece.ZERO, LascaPiece.ZERO]);
            const expectedState: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, vuu],
                [___, ___, ___, ___, ___, ___, ___],
                [__u, ___, ___, ___, ___, ___, ___],
            ], 2);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('Promotion', () => {

        it('should promote the commander of a stack that reached last line', () => {
            // Given a board where a stack is about to reach final line
            const state: LascaState = LascaState.of([
                [___, ___, ___, ___, __v, ___, __v],
                [___, _uv, ___, __v, ___, __v, ___],
                [___, ___, __v, ___, __v, ___, __v],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 0);

            // When doing that move
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 1), new Coord(0, 0)).get();

            // Then the commander of the stack should be promoted
            const expectedState: LascaState = LascaState.of([
                [_Ov, ___, ___, ___, __v, ___, __v],
                [___, ___, ___, __v, ___, __v, ___],
                [___, ___, __v, ___, __v, ___, __v],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should promote piece that reached last line', () => {
            // Given a board where a single piece is about to reach final line
            const state: LascaState = LascaState.of([
                [___, ___, ___, ___, __v, ___, __v],
                [___, __u, ___, __v, ___, __v, ___],
                [___, ___, __v, ___, __v, ___, __v],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 0);

            // When doing that move
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 1), new Coord(0, 0)).get();

            // Then the piece should be promoted
            const expectedState: LascaState = LascaState.of([
                [__O, ___, ___, ___, __v, ___, __v],
                [___, ___, ___, __v, ___, __v, ___],
                [___, ___, __v, ___, __v, ___, __v],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, __u, ___, __u, ___, __u],
                [___, ___, ___, __u, ___, __u, ___],
                [__u, ___, ___, ___, __u, ___, __u],
            ], 1);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('End Game', () => {

        it(`should declare current player winner when opponent has no more commander`, () => {
            // Given a board where Player.ONE have no more commander
            // When evaluating its value
            // Then the current Player.ZERO should win
            const expectedState: LascaState = LascaState.of([
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [_uv, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 1);
            const node: LascaNode = new LascaNode(expectedState);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it(`should declare current player winner when blocking all opponent's pieces`, () => {
            // Given a board where the last commander(s) of Player.ZERO are stucked
            // When evaluating its value
            // Then the board should be considered as a victory of Player.ONE
            const expectedState: LascaState = LascaState.of([
                [__O, ___, __X, ___, ___, ___, ___],
                [___, __X, ___, ___, ___, ___, ___],
                [___, ___, __X, ___, ___, ___, ___],
                [___, ___, ___, __X, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
                [___, ___, ___, ___, ___, ___, ___],
            ], 2);
            const node: LascaNode = new LascaNode(expectedState);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

    });

});
