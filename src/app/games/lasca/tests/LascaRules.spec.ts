/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { LascaControlAndDominationMinimax } from '../LascaControlAndDomination';
import { LascaControlMinimax } from '../LascaControlMinimax';
import { LascaMove } from '../LascaMove';
import { LascaNode, LascaRules, LascaRulesFailure } from '../LascaRules';
import { LascaPiece, LascaSpace, LascaState } from '../LascaState';

describe('LascaRules', () => {

    const zero: LascaPiece = LascaPiece.ZERO;
    const one: LascaPiece = LascaPiece.ONE;
    const zeroOfficer: LascaPiece = LascaPiece.ZERO_OFFICER;
    const oneOfficer: LascaPiece = LascaPiece.ONE_OFFICER;

    const _u: LascaSpace = new LascaSpace([zero]);
    const _O: LascaSpace = new LascaSpace([zeroOfficer]);
    const _v: LascaSpace = new LascaSpace([one]);
    const vu: LascaSpace = new LascaSpace([one, zero]);
    const uv: LascaSpace = new LascaSpace([zero, one]);
    const Ov: LascaSpace = new LascaSpace([zeroOfficer, one]);
    const _X: LascaSpace = new LascaSpace([oneOfficer]);
    const __: LascaSpace = LascaSpace.EMPTY;

    let rules: LascaRules;
    let minimaxes: Minimax<LascaMove, LascaState>[];

    beforeEach(() => {
        rules = new LascaRules(LascaState);
        minimaxes = [
            new LascaControlMinimax(rules, 'Lasca Control Minimax'),
            new LascaControlAndDominationMinimax(rules, 'Lasca Control and Domination Minimax'),
        ];
    });
    describe('Move', () => {
        it('should forbid move when first coord is empty', () => {
            // Given any board
            const state: LascaState = LascaState.getInitialState();

            // When doing a move that starts on an empty coord
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 3), new Coord(2, 2)).get();

            // Then it should fail
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid moving opponent piece', () => {
            // Given any board
            const state: LascaState = LascaState.getInitialState();

            // When doing a move that starts on an opponent's piece
            const move: LascaMove = LascaMove.fromStep(new Coord(0, 2), new Coord(1, 3)).get();

            // Then it should fail
            const reason: string = RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid moving normal piece backward', () => {
            // Given any board
            const state: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, __, __, __, __, __, __],
                [__, __, __, __, _u, __, _u],
                [__, _u, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 0).get();

            // When doing a move that moves a normal piece backward
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 5), new Coord(2, 6)).get();

            // Then it should fail
            const reason: string = LascaRulesFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid landing on an occupied space', () => {
            // Given a board where a piece could be tempted to take another's place
            const state: LascaState = LascaState.getInitialState();

            // When trying to land on an occupied space
            const move: LascaMove = LascaMove.fromStep(new Coord(5, 5), new Coord(4, 4)).get();

            // Then it should fail
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should allow simple move', () => {
            // Given any board
            const state: LascaState = LascaState.getInitialState();

            // When doing a simple move
            const move: LascaMove = LascaMove.fromStep(new Coord(2, 4), new Coord(3, 3)).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, __, __, _u, __, __, __],
                [_u, __, __, __, _u, __, _u],
                [__, _u, __, _u, __, _u, __],
                [_u, __, _u, __, _u, __, _u],
            ], 1).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    describe('Capture', () => {
        it('should forbid continuing move after last capture', () => {
            // Given a board with a possible capture
            const state: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, _u, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();

            // When doing a move that jump over an empty space after capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4), new Coord(2, 6)]).get();

            // Then it should fail
            const reason: string = LascaRulesFailure.CANNOT_CAPTURE_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid skipping capture', () => {
            // Given a board with a possible capture
            const state: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, _u, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();

            // When doing a non capturing move
            const move: LascaMove = LascaMove.fromStep(new Coord(2, 2), new Coord(3, 3)).get();

            // Then it should fail
            const reason: string = LascaRulesFailure.CANNOT_SKIP_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid partial-capture', () => {
            // Given a board on which a capture of two pieces is possible
            const state: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _u, __, _v, __, _v],
                [__, _u, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();

            // When capturing the first but not the second
            const move: LascaMove = LascaMove.fromCapture([new Coord(1, 1), new Coord(3, 3)]).get();

            // Then it should fail
            const reason: string = LascaRulesFailure.MUST_FINISH_CAPTURING();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid self-capturing', () => {
            // Given a board on which a piece could try to capture its ally
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, _v, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1).get();

            // When doing so
            const move: LascaMove = LascaMove.fromCapture([new Coord(1, 1), new Coord(3, 3)]).get();

            // Then it should fail
            const reason: string = RulesFailure.CANNOT_SELF_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should forbid backward capture with normal piece', () => {
            // Given a board on which a normal-piece could try to capture backward
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, _u, __, __],
                [__, __, __, _v, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 1).get();

            // When doing so
            const move: LascaMove = LascaMove.fromCapture([new Coord(3, 3), new Coord(5, 1)]).get();

            // Then it should fail
            const reason: string = LascaRulesFailure.CANNOT_GO_BACKWARD();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('should allow backward capture with officer', () => {
            // Given a board on which an officer can capture backward
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _v, __],
                [__, __, __, __, _O, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 2).get();

            // When doing it
            const move: LascaMove = LascaMove.fromCapture([new Coord(4, 2), new Coord(6, 0)]).get();

            // Then it should be a success
            const expectedState: LascaState = LascaState.from([
                [__, __, __, __, __, __, Ov],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 3).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow to do small capture when big capture available', () => {
            // Given a board where two different sized captures are possible
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, _u, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1).get();

            // When doing the small capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, _u, __, __, __],
                [vu, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 2).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow to do bug capture when samll capture available', () => {
            // Given a board where two different sized captures are possible
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _v, __, __, __, __],
                [__, _u, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
            ], 1).get();

            // When doing the big capture
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]).get();

            // Then it should succeed
            const Xoo: LascaSpace = new LascaSpace([LascaPiece.ONE_OFFICER, LascaPiece.ZERO, LascaPiece.ZERO]);
            const expectedState: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, _u, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, Xoo],
            ], 2).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow capturing standalone opponent piece', () => {
            // Given a board with a possible single-capture
            const state: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, _u, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();

            // When capturing the single piece
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, __, __, _v, __, _v],
                [__, __, __, __, __, __, __],
                [vu, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 2).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow capturing commander of an opponent stack', () => {
            // Given a board with a possible stack-capture
            const state: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, _v, __, _v, __, _v],
                [__, uv, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();

            // When capturing the commander of the stack
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.from([
                [_v, __, _v, __, _v, __, _v],
                [__, _v, __, _v, __, _v, __],
                [_v, __, __, __, _v, __, _v],
                [__, _v, __, __, __, __, __],
                [vu, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 2).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow multiple-capture', () => {
            // Given a board where a multiple captures is possible
            const RE: LascaSpace = new LascaSpace([LascaPiece.ONE, LascaPiece.ZERO, LascaPiece.ZERO]);
            const state: LascaState = LascaState.from([
                [__, __, _v, __, __, __, __],
                [__, __, __, _u, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _u, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_u, __, __, __, __, __, __],
            ], 1).get();

            // When doing the multiple capture
            const move: LascaMove = LascaMove.fromCapture([
                new Coord(2, 0),
                new Coord(4, 2),
                new Coord(6, 4)]).get();

            // Then it should succeed
            const expectedState: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, RE],
                [__, __, __, __, __, __, __],
                [_u, __, __, __, __, __, __],
            ], 2).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    describe('Promotion', () => {
        it('should promote the commander of a stack that reached last line', () => {
            // Given a board where a stack is about to reach final line
            const state: LascaState = LascaState.from([
                [__, __, __, __, _v, __, _v],
                [__, uv, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, __, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 0).get();

            // When doing that move
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 1), new Coord(0, 0)).get();

            // Then the commander of the stack should be promoted
            const expectedState: LascaState = LascaState.from([
                [Ov, __, __, __, _v, __, _v],
                [__, __, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, __, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should promote piece that reached last line', () => {
            // Given a board where a single piece is about to reach final line
            const state: LascaState = LascaState.from([
                [__, __, __, __, _v, __, _v],
                [__, _u, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, __, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 0).get();

            // When doing that move
            const move: LascaMove = LascaMove.fromStep(new Coord(1, 1), new Coord(0, 0)).get();

            // Then the piece should be promoted
            const expectedState: LascaState = LascaState.from([
                [_O, __, __, __, _v, __, _v],
                [__, __, __, _v, __, _v, __],
                [__, __, _v, __, _v, __, _v],
                [__, __, __, __, __, __, __],
                [__, __, _u, __, _u, __, _u],
                [__, __, __, _u, __, _u, __],
                [_u, __, __, __, _u, __, _u],
            ], 1).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    describe('End Game', () => {
        it(`should declare current player winner when capturing last opponent's piece`, () => {
            // Given a board where the last free piece of the opponent is about to be captured
            const state: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, _v, __, __, __, __, __],
                [__, __, _u, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 0).get();

            // When capturing it
            const move: LascaMove = LascaMove.fromCapture([new Coord(2, 4), new Coord(0, 2)]).get();

            // Then the current player should win
            const expectedState: LascaState = LascaState.from([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [uv, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 1).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: LascaNode = new LascaNode(expectedState);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it(`should declare current player winner when blocking all opponent's pieces`, () => {
            // Given a board where the last free piece or stack of the opponent is about to be blocked
            const state: LascaState = LascaState.from([
                [_O, __, _X, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_X, __, _X, __, __, __, __],
                [__, __, __, _X, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 1).get();

            // When blocking it
            const move: LascaMove = LascaMove.fromStep(new Coord(0, 2), new Coord(1, 1)).get();

            // Then the current player should win
            const expectedState: LascaState = LascaState.from([
                [_O, __, _X, __, __, __, __],
                [__, _X, __, __, __, __, __],
                [__, __, _X, __, __, __, __],
                [__, __, __, _X, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 2).get();
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            const node: LascaNode = new LascaNode(expectedState);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
    });
});
