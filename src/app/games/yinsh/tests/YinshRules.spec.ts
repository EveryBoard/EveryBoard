import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { expectToBeVictoryFor } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshFailure } from '../YinshFailure';
import { YinshState } from '../YinshState';
import { YinshLegalityStatus } from '../YinshLegalityStatus';
import { YinshMinimax } from '../YinshMinimax';
import { YinshCapture, YinshMove } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { YinshNode, YinshRules } from '../YinshRules';
import { Table } from 'src/app/utils/ArrayUtils';

describe('YinshRules', () => {

    const _: YinshPiece = YinshPiece.EMPTY;
    const N: YinshPiece = YinshPiece.NONE;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const b: YinshPiece = YinshPiece.MARKER_ONE;
    const B: YinshPiece = YinshPiece.RING_ONE;

    let rules: YinshRules;

    let minimaxes: YinshMinimax[];

    function expectMoveSuccess(state: YinshState, move: YinshMove, expectedState: YinshState): void {
        const legality: YinshLegalityStatus = rules.isLegal(move, state);
        expect(legality.legal).toBeTruthy();
        if (legality.legal.isSuccess()) {
            const resultingState: YinshState = rules.applyLegalMove(move, state, legality);
            expect(resultingState.equals(expectedState)).withContext('state should be equals').toBeTrue();
        } else {
            throw new Error('expected move to be valid but it not: ' + legality.legal.getReason());
        }
    }
    function expectMoveFailure(state: YinshState, move: YinshMove, reason: string): void {
        const legality: YinshLegalityStatus = rules.isLegal(move, state);
        expect(legality.legal.reason).toBe(reason);
    }
    beforeEach(() => {
        rules = new YinshRules(YinshState);
        minimaxes = [new YinshMinimax(rules, 'YinshMinimax')];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start at turn 0').toBe(0);
    });
    describe('isLegal and applyLegalMove', () => {
        it('should initially allow placing rings', () => {
            const state: YinshState = rules.node.gameState;
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.empty(), []);

            const expectedBoard: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: YinshState = new YinshState(expectedBoard, [4, 5], 1);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should initially forbid placing markers', () => {
            const state: YinshState = rules.node.gameState;
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(3, 4)), []);
            expectMoveFailure(state, move, YinshFailure.NO_MARKERS_IN_INITIAL_PHASE());
        });
        it('should forbid placing rings without moving after turn 10', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.empty(), []);
            expectMoveFailure(state, move, YinshFailure.PLACEMENT_AFTER_INITIAL_PHASE());
        });
        it('should allow placing marker in a ring and then moving the ring after turn 10', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 3)), []);

            const expectedBoard: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, _, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: YinshState = new YinshState(expectedBoard, [0, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should forbid a move in an invalid direction', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(5, 8)), []);

            expectMoveFailure(state, move, YinshFailure.MOVE_DIRECTION_INVALID());
        });
        it('should forbid a move that starts from an non-ring', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(5, 5), MGPOptional.of(new Coord(3, 3)), []);

            expectMoveFailure(state, move, YinshFailure.SHOULD_SELECT_PLAYER_RING());
        });
        it('should flip all markers on the path of the moved ring, but not the one that was placed in the ring', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 5)), []);

            const expectedBoard: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, _, _, _, _, _, _, _],
                [N, N, _, b, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, A, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: YinshState = new YinshState(expectedBoard, [0, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should allow moving above empty spaces as long as it lands after the first empty space following a marker', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 6)), []);

            const expectedBoard: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, A, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: YinshState = new YinshState(expectedBoard, [0, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should forbid moving more than one space beyond the last marker of the group jumped', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 7)), []);

            expectMoveFailure(state, move, YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS());
        });
        it('should forbid moving over two sets of markers', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 8)), []);

            expectMoveFailure(state, move, YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS());
        });
        it('should forbid moving over rings', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, B, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 6)), []);

            expectMoveFailure(state, move, YinshFailure.MOVE_SHOULD_NOT_PASS_ABOVE_RING());
        });
        it('should forbid captures that do not take a ring', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, b, _, A, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 7)),
                                                  [YinshCapture.of(new Coord(3, 2), new Coord(3, 6),
                                                                   new Coord(6, 3))]);
            expectMoveFailure(state, move, YinshFailure.CAPTURE_SHOULD_TAKE_RING());

        });
        it(`should allow captures, and should increase the capturing player's side rings by one when capturing`, () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, b, _, A, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 7)),
                                                  [YinshCapture.of(new Coord(3, 2), new Coord(3, 6),
                                                                   new Coord(5, 3))]);

            const expectedBoard: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, A, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: YinshState = new YinshState(expectedBoard, [1, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should support multiple captures', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, a, A, A, A, _, _, _],
                [N, N, _, a, a, _, _, _, _, _, _],
                [N, _, _, a, a, _, _, _, _, _, _],
                [N, _, _, a, a, _, _, _, _, _, N],
                [_, _, _, a, a, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([
                YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(6, 2)),
                YinshCapture.of(new Coord(4, 2), new Coord(4, 6), new Coord(7, 2)),
            ],
                                                  new Coord(5, 2), MGPOptional.of(new Coord(5, 3)),
                                                  []);
            const expectedBoard: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, a, _, _, _, _, _],
                [N, N, _, _, _, A, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: YinshState = new YinshState(expectedBoard, [2, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should forbid not making initial captures when it is possible', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(4, 2)), []);

            expectMoveFailure(state, move, YinshFailure.MISSING_CAPTURES());
        });
        it('should forbid not making final captures when it is possible', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, b, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 20);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 7)), []);

            expectMoveFailure(state, move, YinshFailure.MISSING_CAPTURES());
        });
        it(`should forbid capturing the opponent's markers`, () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(4, 2))],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 3)),
                                                  []);

            expectMoveFailure(state, move, YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS());
        });
        it('should forbid capturing empty cases', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(4, 2))],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(4, 2)),
                                                  []);

            expectMoveFailure(state, move, YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS());
        });
        it('should not allow making moves once victory has been reached', () => {
        });
        it('should correctly apply move even if the results are not cached in the legality status', () => {
            // Given a move (that should not have cached thingy ?)
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);

            // when applying a move
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 3)), []);

            // then the move should be legal still
            const expectedBoard: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, _, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: YinshState = new YinshState(expectedBoard, [0, 0], 11);
            expectMoveSuccess(state, move, expectedState);
        });
    });
    describe('getPossibleCaptures', () => {
        it('should not consider rings as capturable pieces', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, A, A, _, _, _, _, _, _],
                [N, _, _, A, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            expect(rules.getPossibleCaptures(state)).toEqual([]);
        });
        it('should not consider aligned markers of different players as capturable', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, N, _, _, _, _, _, _],
                [N, N, N, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            expect(rules.getPossibleCaptures(state)).toEqual([]);
        });
        it('should not consider 4 aligned markers as capturable', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const captures: YinshCapture[] = rules.getPossibleCaptures(state);
            expect(captures.length).toBe(0);
        });
        it('should consider 5 aligned markers as capturable', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const captures: YinshCapture[] = rules.getPossibleCaptures(state);
            expect(captures.length).toBe(1);
            expect(captures[0].equals(YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(-1, -1)))).toBeTrue();
        });
        it('should consider 6 aligned markers as two possible captures', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, _, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const captures: YinshCapture[] = rules.getPossibleCaptures(state);
            expect(captures.length).toBe(2);
            expect(captures.some((c: YinshCapture): boolean =>
                c.equals(YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(-1, -1))))).toBeTrue();
            expect(captures.some((c: YinshCapture): boolean =>
                c.equals(YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(-1, -1))))).toBeTrue();
        });
        it('should detect capture on specific board', () => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, b, _, _],
                [N, N, _, _, _, _, _, a, _, _, _],
                [N, _, _, _, _, _, a, _, _, _, _],
                [N, _, _, _, _, a, _, _, _, _, N],
                [_, _, _, _, a, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, b, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            const captures: YinshCapture[] = rules.getPossibleCaptures(state);
            expect(captures.length).toBe(1);
        });
    });
    describe('getGameStatus', () => {
        it('should consider initial phase as ongoing', () => {
            const state: YinshState = YinshState.getInitialState();
            expect(rules.getGameStatus(new YinshNode(MGPOptional.empty(), null, state))).toBe(GameStatus.ONGOING);
        });
        it('should detect part after initial phase as ongoing if victory criterion is not met', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [0, 0], 20);
            expect(rules.getGameStatus(new YinshNode(MGPOptional.empty(), null, state))).toBe(GameStatus.ONGOING);
        });
        it('should detect victory for a player if it obtains more than 3 rings', () => {
            const state1: YinshState = new YinshState(YinshState.getInitialState().board, [3, 0], 20);
            const node1: YinshNode = new YinshNode(MGPOptional.empty(), null, state1);
            expectToBeVictoryFor(rules, node1, Player.ZERO, minimaxes);

            const state2: YinshState = new YinshState(YinshState.getInitialState().board, [0, 3], 20);
            const node2: YinshNode = new YinshNode(MGPOptional.empty(), null, state2);
            expectToBeVictoryFor(rules, node2, Player.ONE, minimaxes);

        });
    });
});
