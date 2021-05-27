import { MinimaxTestingNode, MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingMinimax } from '../MinimaxTestingMinimax';
import { Player } from 'src/app/jscaip/Player';

describe('MinimaxTestingRules', () => {

    const minimax: MinimaxTestingMinimax = new MinimaxTestingMinimax('MinimaxTesting');

    it('should be created', () => {
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        expect(rules).toBeTruthy();
    });
    it('should be a victory of second player', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        expect(rules.choose(MinimaxTestingMove.RIGHT)).toBeTrue();
        expect(minimax.getBoardValue(rules.node).value)
            .toEqual(Player.ONE.getVictoryValue());
    });
    it('IA should avoid loosing 4 move in a row', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i < 5; i++) {
            bestMove = rules.node.findBestMove(1, minimax);
            rules.choose(bestMove);
            const value: number = minimax.getBoardValue(rules.node).value;
            expect(value).toEqual(i);
        }
    });
    xit('should not create sister-node to winning-node', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const bestMove: MinimaxTestingMove = rules.node.findBestMove(5, minimax);
        expect(bestMove).toEqual(MinimaxTestingMove.DOWN);
        expect(rules.node.getHopedValue(minimax)).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.node.countDescendants()).toEqual(10);
    });
    it('IA(depth=1) should create exactly 2 child at each turn before reaching the border', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const initialNode: MinimaxTestingNode = rules.node;
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i <= 3; i++) {
            bestMove = rules.node.findBestMove(1, minimax);
            rules.choose(bestMove);
        }
        expect(initialNode.countDescendants()).toEqual(6);
    });
    it('Minimax should prune', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const initialNode: MinimaxTestingNode = rules.node;
        spyOn(minimax, 'getBoardValue').and.callThrough();
        spyOn(minimax, 'getListMoves').and.callThrough();

        rules.node.findBestMove(3, minimax);

        expect(minimax.getBoardValue).toHaveBeenCalledTimes(11); // should be 14 without pruning
        expect(initialNode.countDescendants()).toBe(11); // should be 14 without pruning as well
        expect(minimax.getListMoves).toHaveBeenCalledTimes(6); // should be 7 without pruning

        expect(initialNode.getHopedValue(minimax)).toBe(3);
    });
    it('Should not go further than the end game', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const initialNode: MinimaxTestingNode = rules.node;
        spyOn(minimax, 'getBoardValue').and.callThrough();
        spyOn(minimax, 'getListMoves').and.callThrough();

        rules.node.findBestMove(7, minimax);

        expect(minimax.getBoardValue).toHaveBeenCalledTimes(30); // should be 68 times without pruning
        expect(initialNode.countDescendants()).toBe(30); // should be 68 without pruning
        expect(minimax.getListMoves).toHaveBeenCalledTimes(24); // should be 69 without pruning
    });
    describe('Should choose the first one to minimise calculation when all choice are the same value', () => {
        it('depth = 1', () => {
            MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_2;
            const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
            const bestMove: MinimaxTestingMove = rules.node.findBestMove(1, minimax);
            expect(bestMove).toEqual(minimax.getListMoves(rules.node)[0]);
            expect(rules.node.countDescendants()).toEqual(2);
        });
        it('depth = 2', () => {
            MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_3;
            spyOn(minimax, 'getListMoves').and.callThrough();
            const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
            const bestMove: MinimaxTestingMove = rules.node.findBestMove(2, minimax);
            expect(bestMove).toEqual(minimax.getListMoves(rules.node)[0]);
            expect(rules.node.countDescendants()).toEqual(3);
            expect(minimax.getListMoves).toHaveBeenCalledTimes(3);
        });
    });
});
