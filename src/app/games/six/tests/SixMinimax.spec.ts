import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { expectFirstStateToBeBetterThanSecond, expectStateToBePreVictory } from 'src/app/utils/tests/TestUtils.spec';
import { SixGameState } from '../SixGameState';
import { SixMove } from '../SixMove';
import { SixNode, SixRules } from '../SixRules';
import { SixMinimax } from "../SixMinimax";

describe('SixMinimax', () => {

    let rules: SixRules;
    let minimax: SixMinimax;

    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;
    const _: number = Player.NONE.value;

    beforeEach(() => {
        rules = new SixRules(SixGameState);
        minimax = new SixMinimax('SixMinimax');
    });
    describe('pre-victories', () => {
        it('Should pass forcing move to children node to minimise calculations', () => {
            const board: number[][] = [
                [X, _, _, _, _, _, X],
                [O, _, _, _, _, O, _],
                [O, _, _, _, O, _, _],
                [O, _, _, O, X, _, _],
                [O, _, O, X, _, _, _],
                [_, O, X, X, _, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixGameState = SixGameState.fromRepresentation(board, 10);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 5));
            rules.node = new SixNode(null, null, state);
            expect(rules.choose(move)).toBeTrue();
            const chosenMove: SixMove = rules.node.findBestMove(1, minimax);
            expect(chosenMove).toEqual(SixMove.fromDrop(new Coord(0, 6)));
            expect(rules.node.countDescendants()).toBe(1);
        });
        it('should know that 5 pieces aligned with two empty extension mean PRE_VICTORY', () => {
            const state: SixGameState = SixGameState.fromRepresentation([
                [X, X, X, X, X],
            ], 2);
            const previousMove: SixMove = SixMove.fromDrop(new Coord(0, 0));
            expectStateToBePreVictory(state, previousMove, Player.ONE, minimax);
        });
        it('should know that full-bowtie aligned with two empty extension mean PRE_VICTORY', () => {
            const state: SixGameState = SixGameState.fromRepresentation([
                [_, O, O, O],
                [O, O, O, X],
                [O, X, X, X],
                [O, X, X, _],

            ], 2);
            const previousMove: SixMove = SixMove.fromDrop(new Coord(2, 2));
            expectStateToBePreVictory(state, previousMove, Player.ONE, minimax);
        });
        it('shound only count one preVictory when one coord is a forcing move for two lines', () => {
            const board: number[][] = [
                [_, _, X, _, _, X],
                [_, _, O, _, O, _],
                [_, _, O, O, _, _],
                [_, _, _, _, _, O],
                [_, O, O, _, O, X],
                [O, _, O, O, X, X],
            ];
            const state: SixGameState = SixGameState.fromRepresentation(board, 9);
            const move: SixMove = SixMove.fromDrop(new Coord(2, 3));
            rules.node = new SixNode(null, null, state);
            const boardValue: { value: number, preVictory?: Coord } = minimax.getBoardValue(move, state);
            expect(boardValue.preVictory).toBeUndefined();
            expect(boardValue.value).toBe(Player.ZERO.getPreVictory());
        });
    });
    describe('4 pieces aligned is better than 3 pieces aligned', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, _, _],
                [O, O, O, O, O, O],
            ], 4);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, X, _],
                [O, O, O, O, O, O],
            ], 4);
            expectFirstStateToBeBetterThanSecond(weakerState, move, strongerState, move, minimax);
        });
        it('should be true with triangle', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(1, 3));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O],
                [O, X, _, _, O],
                [O, X, _, O, O],
                [O, X, O, O, _],
                [O, O, O, _, _],
            ], 4);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O],
                [O, X, X, X, O],
                [O, _, _, O, O],
                [O, X, O, O, _],
                [O, O, O, _, _],
            ], 4);
            expectFirstStateToBeBetterThanSecond(weakerState, move, strongerState, move, minimax);
        });
        it('should be true with circle', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(2, 1));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [_, O, O, O, O],
                [O, O, X, X, O],
                [O, _, O, X, O],
                [O, _, _, O, O],
                [O, O, O, O, _],
            ], 4);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [_, O, O, O, O],
                [O, O, X, X, O],
                [O, _, O, X, O],
                [O, _, X, O, O],
                [O, O, O, O, _],
            ], 4);
            expectFirstStateToBeBetterThanSecond(weakerState, move, strongerState, move, minimax);
        });
    });
    describe('4 pieces aligned with two spaces should be better than 4 aligned with two ennemies', () => {
        it('should be true with lines', () => {
            const move: SixMove = SixMove.fromDrop(new Coord(1, 1));
            const weakerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [O, X, X, X, X, O],
                [O, O, O, O, O, O],
            ], 6);
            const strongerState: SixGameState = SixGameState.fromRepresentation([
                [O, O, O, O, O, O],
                [_, X, X, X, X, _],
                [O, O, O, O, O, O],
            ], 6);
            expectFirstStateToBeBetterThanSecond(weakerState, move, strongerState, move, minimax);
        });
    });
    describe('Phase 2', () => {
        it('Should not consider moving piece that are blocking an ennemy victory', () => {
            const board: number[][] = [
                [O, O, _, _, _, _, O],
                [X, _, _, _, _, X, _],
                [X, _, _, O, X, X, _],
                [X, X, O, X, X, O, _],
                [X, _, X, X, O, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixGameState = SixGameState.fromRepresentation(board, 39);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 5));
            rules.node = new SixNode(null, null, state);
            expect(rules.choose(move)).toBeTrue();
            const bestMove: SixMove = rules.node.findBestMove(1, minimax);
            const expectedMove: SixMove = SixMove.fromDeplacement(new Coord(1, 0), new Coord(0, 6));
            expect(bestMove).toEqual(expectedMove);
            expect(rules.node.countDescendants()).toBe(1);
        });
        it('Should propose only one starting piece when all piece are blocking an ennemy victory', () => {
            const board: number[][] = [
                [O, _, _, _, _, _, O],
                [X, _, _, _, _, X, _],
                [X, _, _, O, X, X, _],
                [X, X, O, X, X, O, _],
                [X, _, X, X, O, _, _],
                [_, X, _, _, _, _, _],
            ];
            const state: SixGameState = SixGameState.fromRepresentation(board, 39);
            rules.node = new SixNode(null, null, state);
            const move: SixMove = SixMove.fromDrop(new Coord(0, 5));
            expect(rules.choose(move)).toBeTrue();

            expect(rules.getGameStatus(rules.node.gamePartSlice, rules.node.move).isEndGame).toBeFalse();
            const bestMove: SixMove = rules.node.findBestMove(1, minimax);
            expect(bestMove).toEqual(SixMove.fromDeplacement(new Coord(0, 0), new Coord(0, 6)));
            expect(rules.node.countDescendants()).toBe(1);

            expect(rules.choose(bestMove)).toBeTrue();
            expect(rules.getGameStatus(rules.node.gamePartSlice, rules.node.move).isEndGame).toBeFalse();
        });
        // TODO: comparing what's best between that calculation and Phase 1 one
        it('Score after 40th turn should be a substraction of the number of piece', () => {
            const state: SixGameState = SixGameState.fromRepresentation([
                [X, X, X, X, O, O, O, O, O],
                [X, X, X, X, O, O, O, O, O],
            ], 40);
            expect(minimax.getBoardNumericValue(SixMove.fromDrop(new Coord(1, 1)), state)).toBe(2);
        });
    });
});
