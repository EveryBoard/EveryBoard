import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshBoard } from '../YinshBoard';
import { YinshFailure } from '../YinshFailure';
import { YinshGameState } from '../YinshGameState';
import { YinshLegalityStatus } from '../YinshLegalityStatus';
import { YinshCapture, YinshMove } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { YinshRules } from '../YinshRules';

describe('YinshRules', () => {
    const _: YinshPiece = YinshPiece.EMPTY;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const b: YinshPiece = YinshPiece.MARKER_ONE;
    const B: YinshPiece = YinshPiece.RING_ONE;

    let rules: YinshRules;

    // let minimax: YinshMinimax;

    function expectMoveSuccess(stateBefore: YinshGameState, move: YinshMove, stateAfter: YinshGameState): void {
        const legality: YinshLegalityStatus = rules.isLegal(move, stateBefore);
        expect(legality.legal).toBeTruthy();
        expect(legality.legal.isSuccess()).toBeTrue();
        if (legality.legal.isSuccess()) {
            const resultingState: YinshGameState = rules.applyLegalMove(move, stateBefore, legality);
            expect(resultingState.equals(stateAfter)).toBeTrue();
        } else {
            throw new Error('expected move to be valid but it is not: ' + legality.legal.getReason());
        }
    }

    function expectMoveFailure(state: YinshGameState, move: YinshMove, reason: string): void {
        const legality: YinshLegalityStatus = rules.isLegal(move, state);
        expect(legality.legal).toBeTruthy();
        expect(legality.legal.isFailure()).toBeTrue();
        expect(legality.legal.getReason()).toBe(reason);
    }

    beforeEach(() => {
        rules = new YinshRules(YinshGameState);
        // minimax = new YinshMinimax(rules, 'YinshMinimax');
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).withContext('Game should start at turn 0').toBe(0);
    });
    describe('isLegal and applyLegalMove', () => {
        it('should initially allow placing rings', () => {
            const state: YinshGameState = rules.node.gamePartSlice;
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.empty(), []);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [4, 5], 1);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should initially forbid placing markers', () => {
            const state: YinshGameState = rules.node.gamePartSlice;
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(3, 4)), []);
            expectMoveFailure(state, move, YinshFailure.NO_MARKERS_IN_INITIAL_PHASE);
        });
        it('should forbid placing rings without moving after turn 10', () => {
            const state: YinshGameState = new YinshGameState(YinshBoard.EMPTY, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.empty(), []);
            expectMoveFailure(state, move, YinshFailure.PLACEMENT_AFTER_INITIAL_PHASE);
        });
        it('should allow placing marker in a ring and then moving the ring after turn 10', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 3)), []);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [0, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should flip all markers on the path of the moved ring, but not the one that was placed in the ring', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 5)), []);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [0, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should allow moving above empty spaces as long as it lands after the first empty space following a marker', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 6)), []);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [0, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should forbid moving more than one space beyond the last marker of the group jumped', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 7)), []);

            expectMoveFailure(state, move, YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS);
        });
        it('should forbid moving over two sets of markers', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 8)), []);

            expectMoveFailure(state, move, YinshFailure.MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS);
        });
        it('should forbid moving over rings', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, B, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 6)), []);

            expectMoveFailure(state, move, YinshFailure.MOVE_SHOULD_NOT_PASS_ABOVE_RING);
        });
        it('should forbid captures that do not take a ring', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, b, _, A, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 7)),
                                                  [YinshCapture.of(new Coord(3, 2), new Coord(3, 6),
                                                                   new Coord(6, 3))]);
            expectMoveFailure(state, move, YinshFailure.CAPTURE_SHOULD_TAKE_RING);

        });
        it('should allow captures, and should increase the capturing player\'s side rings by one when capturing', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, b, _, A, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 7)),
                                                  [YinshCapture.of(new Coord(3, 2), new Coord(3, 6),
                                                                   new Coord(5, 3))]);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [1, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should support multiple captures', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, a, A, A, A, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([
                YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(6, 2)),
                YinshCapture.of(new Coord(4, 2), new Coord(4, 6), new Coord(7, 2)),
            ],
                                                  new Coord(5, 2), MGPOptional.of(new Coord(5, 3)),
                                                  []);
            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, a, _, _, _, _, _],
                [_, _, _, _, _, A, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [2, 0], 11);

            expectMoveSuccess(state, move, expectedState);
        });
        it('should forbid not making initial captures when it is possible', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(4, 2)), []);

            expectMoveFailure(state, move, YinshFailure.MISSING_CAPTURES);
        });
        it('should forbid not making final captures when it is possible', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.of(new Coord(3, 7)), []);

            expectMoveFailure(state, move, YinshFailure.MISSING_CAPTURES);
        });
        it('should forbid capturing the opponent\'s markers', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(4, 2))],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 3)),
                                                  []);

            expectMoveFailure(state, move, YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS);
        });
        it('should forbid capturing empty cases', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(4, 2))],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(4, 2)),
                                                  []);

            expectMoveFailure(state, move, YinshFailure.CAN_ONLY_CAPTURE_YOUR_MARKERS);
        });
        it('should not allow making moves once victory has been reached', () => {
        });
    });
    describe('getPossibleCaptures', () => {
        it('should not consider rings as capturable pieces', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            expect(rules.getPossibleCaptures(state)).toEqual([]);
        });
        it('should not consider aligned markers of different players as capturable', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, b, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            expect(rules.getPossibleCaptures(state)).toEqual([]);
        });
        it('should not consider 4 aligned markers as capturable', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const captures: YinshCapture[] = rules.getPossibleCaptures(state);
            expect(captures.length).toBe(0);
        });
        it('should consider 5 aligned markers as capturable', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const captures: YinshCapture[] = rules.getPossibleCaptures(state);
            expect(captures.length).toBe(1);
            expect(captures[0].equals(YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(-1, -1)))).toBeTrue();
        });
        it('should consider 6 aligned markers as two possible captures', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const captures: YinshCapture[] = rules.getPossibleCaptures(state);
            expect(captures.length).toBe(2);
            expect(captures.some((c: YinshCapture): boolean =>
                c.equals(YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(-1, -1))))).toBeTrue();
            expect(captures.some((c: YinshCapture): boolean =>
                c.equals(YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(-1, -1))))).toBeTrue();
        });
    });
});
