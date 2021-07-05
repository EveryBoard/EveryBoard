import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshBoard } from '../YinshBoard';
import { YinshFailure } from '../YinshFailure';
import { YinshGameState } from '../YinshGameState';
import { YinshLegalityStatus } from '../YinshLegalityStatus';
import { YinshMove } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { YinshRules } from '../YinshRules';

describe('YinshRules', () => {
    const _: YinshPiece = YinshPiece.EMPTY;
    const Am: YinshPiece = YinshPiece.MARKER_ZERO;
    const Ar: YinshPiece = YinshPiece.RING_ZERO;
    const Arm: YinshPiece = YinshPiece.RINGMARKER_ZERO;
    const Bm: YinshPiece = YinshPiece.MARKER_ONE;
    const Br: YinshPiece = YinshPiece.RING_ONE;
    const Brm: YinshPiece = YinshPiece.RINGMARKER_ONE;
    let rules: YinshRules;

    // let minimax: YinshMinimax;

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
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.empty(), []);

            const legality: YinshLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingState: YinshGameState = rules.applyLegalMove(move, state, legality);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Ar, _, _, _, _, _, _, _],
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

            expect(resultingState.equals(expectedState)).toBeTrue();
        });
        it('should initially forbid placing markers', () => {
            const state: YinshGameState = rules.node.gamePartSlice;
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(3, 4)), []);

            const legality: YinshLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isFailure()).toBeTrue();
            expect(legality.legal.getReason()).toBe(YinshFailure.NO_MARKERS_IN_INITIAL_PHASE);
        });
        it('should forbid placing rings without moving after turn 10', () => {
            const state: YinshGameState = new YinshGameState(YinshBoard.EMPTY, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.empty(), []);

            const legality: YinshLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isFailure()).toBeTrue();
            expect(legality.legal.getReason()).toBe(YinshFailure.PLACEMENT_AFTER_INITIAL_PHASE);
        });
        it('should allow placing marker in a ring and then moving the ring after turn 10', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Ar, _, _, _, _, _, _, _],
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
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(3, 4)), []);

            const legality: YinshLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingState: YinshGameState = rules.applyLegalMove(move, state, legality);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Am, _, _, _, _, _, _, _],
                [_, _, _, Ar, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [0, 0], 1);

            expect(resultingState.equals(expectedState)).toBeTrue();
        });
        it('should flip all markers on the path of the moved ring, but not the one that was placed in the ring', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Ar, _, _, _, _, _, _, _],
                [_, _, _, Am, _, _, _, _, _, _, _],
                [_, _, _, Bm, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(3, 6)), []);

            const legality: YinshLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingState: YinshGameState = rules.applyLegalMove(move, state, legality);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Am, _, _, _, _, _, _, _],
                [_, _, _, Bm, _, _, _, _, _, _, _],
                [_, _, _, Am, _, _, _, _, _, _, _],
                [_, _, _, Ar, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [0, 0], 1);

            expect(resultingState.equals(expectedState)).toBeTrue();
        });
        it('should allow moving above empty spaces as long as it lands after the first empty space following a marker', () => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Ar, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Bm, _, _, _, _, _, _, _],
                [_, _, _, Am, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            const move: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(3, 7)), []);

            const legality: YinshLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingState: YinshGameState = rules.applyLegalMove(move, state, legality);

            const expectedBoard: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Am, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, Am, _, _, _, _, _, _, _],
                [_, _, _, Bm, _, _, _, _, _, _, _],
                [_, _, _, Ar, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const expectedState: YinshGameState = new YinshGameState(expectedBoard, [0, 0], 1);

            expect(resultingState.equals(expectedState)).toBeTrue();
        });
        it('should forbid moving over rings', () => {
        });
        it('should force to choose the captures when possible', () => {
        });
        it('should allow captures, and should increase the capturing player\'s side rings by one when capturing', () => {
        });
        it('should not allow making moves once victory has been reached', () => {
        });
        it('should support multiple captures', () => {
        });
        it('should forbid capturing the opponent\'s markers', () => {
        });
        it('should forbid capturing less than 5 markers', () => {
        });
        it('should forbid capturing more than 5 markers', () => {
        });
        it('should force captures at the beginning of the player turn when possible', () => {
        });
        it('should forbid placing a marker in a ring that is stuck', () => {
        });
    });
});
