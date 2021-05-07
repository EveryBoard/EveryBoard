import { MinimaxTestingNode, MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';
import { MinimaxTestingMove } from '../MinimaxTestingMove';

describe('MinimaxTestingRules', () => {

    it('should be created', () => {
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        expect(rules).toBeTruthy();
    });
    it('should be a victory of second player', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        expect(rules.choose(MinimaxTestingMove.RIGHT)).toBeTrue();
        expect(rules.getBoardValue(rules.node.move, rules.node.gamePartSlice)).toEqual(Number.MAX_SAFE_INTEGER);
    });
    it('IA should avoid loosing 4 move in a row', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i < 5; i++) {
            bestMove = rules.node.findBestMove(1);
            rules.choose(bestMove);
            expect(rules.getBoardValue(rules.node.move, rules.node.gamePartSlice)).toEqual(i);
        }
    });
    xit('IA should not create sister-node to winning-node', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const bestMove: MinimaxTestingMove = rules.node.findBestMove(5);
        expect(bestMove).toEqual(MinimaxTestingMove.DOWN);
        expect(rules.node.getHopedValue()).toEqual(Number.MIN_SAFE_INTEGER);
        expect(rules.node.countDescendants()).toEqual(10);
    });
    it('IA(depth=1) should create exactly 2 child at each turn before reaching the border', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const initialNode: MinimaxTestingNode = rules.node;
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i <= 3; i++) {
            bestMove = rules.node.findBestMove(1);
            rules.choose(bestMove);
        }
        expect(initialNode.countDescendants()).toEqual(6);
    });
    it('Minimax should prune', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const initialNode: MinimaxTestingNode = rules.node;
        spyOn(rules, 'getBoardValue').and.callThrough();
        spyOn(rules, 'getListMoves').and.callThrough();

        rules.node.findBestMove(3);

        expect(rules.getBoardValue).toHaveBeenCalledTimes(11); // should be 14 without pruning
        expect(initialNode.countDescendants()).toBe(11); // should be 14 without pruning as well
        expect(rules.getListMoves).toHaveBeenCalledTimes(6); // should be 7 without pruning

        expect(initialNode.getHopedValue()).toBe(3);
    });
    it('Should not go further than the end game', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const initialNode: MinimaxTestingNode = rules.node;
        spyOn(rules, 'getBoardValue').and.callThrough();
        spyOn(rules, 'getListMoves').and.callThrough();

        rules.node.findBestMove(7);

        expect(rules.getBoardValue).toHaveBeenCalledTimes(30); // should be 68 times without pruning
        expect(initialNode.countDescendants()).toBe(30); // should be 68 without pruning
        expect(rules.getListMoves).toHaveBeenCalledTimes(31); // should be 69 without pruning
    });
});
