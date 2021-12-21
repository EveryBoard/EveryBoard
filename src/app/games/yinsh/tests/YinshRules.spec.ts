import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshFailure } from '../YinshFailure';
import { YinshState } from '../YinshState';
import { YinshMinimax } from '../YinshMinimax';
import { YinshCapture, YinshMove } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { YinshLegalityInformation, YinshNode, YinshRules } from '../YinshRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('YinshRules', () => {

    const _: YinshPiece = YinshPiece.EMPTY;
    const N: YinshPiece = YinshPiece.NONE;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const b: YinshPiece = YinshPiece.MARKER_ONE;
    const B: YinshPiece = YinshPiece.RING_ONE;

    let rules: YinshRules;

    let minimaxes: Minimax<YinshMove, YinshState, YinshLegalityInformation>[];

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

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should initially forbid placing markers', () => {
            const state: YinshState = rules.node.gameState;
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(3, 4)), []);
            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.NO_MARKERS_IN_INITIAL_PHASE());
        });
        it('should forbid placing rings without moving after turn 10', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.empty(), []);
            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.PLACEMENT_AFTER_INITIAL_PHASE());
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

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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

            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.MOVE_DIRECTION_INVALID());
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

            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.SHOULD_SELECT_PLAYER_RING());
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

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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
            const reason: string = YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS();

            RulesUtils.expectMoveFailure(rules, state, move, reason);
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
            const reason: string = YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS();

            RulesUtils.expectMoveFailure(rules, state, move, reason);
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

            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.MOVE_SHOULD_NOT_PASS_ABOVE_RING());
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
            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.CAPTURE_SHOULD_TAKE_RING());

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

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
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

            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.MISSING_CAPTURES());
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

            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.MISSING_CAPTURES());
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

            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS());
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

            RulesUtils.expectMoveFailure(rules, state, move, YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS());
        });
        it('should not allow making moves once victory has been reached', () => {
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
            expect(rules.getGameStatus(new YinshNode(state))).toBe(GameStatus.ONGOING);
        });
        it('should detect part after initial phase as ongoing if victory criterion is not met', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [0, 0], 20);
            expect(rules.getGameStatus(new YinshNode(state))).toBe(GameStatus.ONGOING);
        });
        it('should detect victory for a player if it obtains more than 3 rings (Player.ZERO)', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [3, 0], 20);
            const node: YinshNode = new YinshNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
        it('should detect victory for a player if it obtains more than 3 rings (Player.ONE)', () => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [0, 3], 20);
            const node: YinshNode = new YinshNode(state);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
    });
});
