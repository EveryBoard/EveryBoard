/* eslint-disable max-lines-per-function */
import { MinimaxTestingMinimax } from '../MinimaxTestingMinimax';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingNode, MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingState } from '../MinimaxTestingState';

describe('MinimaxTestingMinimax', () => {

    let rules: MinimaxTestingRules;
    let minimax: MinimaxTestingMinimax;
    beforeEach(() => {
        rules = new MinimaxTestingRules(MinimaxTestingState);
        minimax = new MinimaxTestingMinimax(rules, 'Minimax Testing Minimax');
    });
    it('IA should avoid loosing 4 move in a row', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i < 5; i++) {
            bestMove = rules.node.findBestMove(1, minimax);
            rules.choose(bestMove);
            const value: number = minimax.getBoardValue(rules.node).value;
            expect(value).toEqual(i);
        }
    });
    xit('should not create sister-node to winning-node', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_1;
        const bestMove: MinimaxTestingMove = rules.node.findBestMove(5, minimax);
        expect(bestMove).toEqual(MinimaxTestingMove.DOWN);
        expect(rules.node.getHopedValue(minimax)).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.node.countDescendants()).toEqual(10);
    });
    it('IA(depth=1) should create exactly 2 child at each turn before reaching the border', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_0;
        const initialNode: MinimaxTestingNode = rules.node;
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i <= 3; i++) {
            bestMove = rules.node.findBestMove(1, minimax);
            rules.choose(bestMove);
        }
        expect(initialNode.countDescendants()).toEqual(6);
    });
    it('Should not go further than the end game', () => {
        MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_0;
        const initialNode: MinimaxTestingNode = rules.node;
        spyOn(minimax, 'getBoardValue').and.callThrough();
        spyOn(minimax, 'getListMoves').and.callThrough();

        rules.node.findBestMove(7, minimax);

        expect(minimax.getBoardValue).toHaveBeenCalledTimes(68);
        expect(initialNode.countDescendants()).toBe(68);
        expect(minimax.getListMoves).toHaveBeenCalledTimes(49);
    });
    describe('Should choose the first one to minimize calculation when all choice are the same value', () => {
        it('depth = 1', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_2;
            const bestMove: MinimaxTestingMove = rules.node.findBestMove(1, minimax, false);
            expect(bestMove).toEqual(minimax.getListMoves(rules.node)[0]);
            expect(rules.node.countDescendants()).toEqual(2);
        });
        it('depth = 2', () => {
            MinimaxTestingState.initialBoard = MinimaxTestingState.BOARD_3;
            spyOn(minimax, 'getListMoves').and.callThrough();
            const bestMove: MinimaxTestingMove = rules.node.findBestMove(2, minimax, false);
            // Depth = 2 means one call for the root node, and one for both of its children nodes, so 3 in total
            expect(minimax.getListMoves).toHaveBeenCalledTimes(3);
            expect(bestMove).toEqual(minimax.getListMoves(rules.node)[0]);
            expect(rules.node.countDescendants()).toEqual(6);
        });
    });
});
