import { MinimaxTestingRules } from './MinimaxTestingRules';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';
import { MinimaxTestingMove } from '../minimax-testing-move/MinimaxTestingMove';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';

describe('MinimaxTestingRules', () => {
    beforeEach(() => {
        MGPNode.NB_NODE_CREATED = 0;
        MinimaxTestingRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        MinimaxTestingRules.GET_LIST_MOVES_CALL_COUNT = 0;
    });
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
            bestMove = rules.node.findBestMoveAndSetDepth(1).move;
            rules.choose(bestMove);
            expect(rules.getBoardValue(rules.node.move, rules.node.gamePartSlice)).toEqual(i);
        }
    });
    it('IA should not create sister-node to winning-node', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const bestMove: MinimaxTestingMove = rules.node.findBestMoveAndSetDepth(5).move;
        expect(bestMove).toEqual(MinimaxTestingMove.DOWN);
        expect(rules.node.getHopedValue()).toEqual(Number.MIN_SAFE_INTEGER);
        expect(MGPNode.NB_NODE_CREATED).toEqual(10);
    });
    it('IA(depth=1) should create exactly 2 child at each turn before reaching the border', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        let bestMove: MinimaxTestingMove;
        for (let i: number = 1; i <= 3; i++) {
            MGPNode.NB_NODE_CREATED = 0;
            bestMove = rules.node.findBestMoveAndSetDepth(1).move;
            rules.choose(bestMove);
            expect(MGPNode.NB_NODE_CREATED).toEqual(2);
        }
    });
    it('IA(depth=2) should not recalculate already created node', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        let boardValue: number;
        let bestMove: MinimaxTestingMove;
        for (let i: number = 0; i < 6; i++) {
            MGPNode.NB_NODE_CREATED = 0;
            bestMove = rules.node.findBestMoveAndSetDepth(2).move;
            boardValue = rules.getBoardValue(rules.node.move, rules.node.gamePartSlice);
            expect(MGPNode.NB_NODE_CREATED).toBe(boardValue, 'at turn ' + i);
            rules.choose(bestMove);
        }
    });
    it('IA(depth=3) should create exactly 14 descendant', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        rules.node.findBestMoveAndSetDepth(3);
        expect(rules.node.countDescendants()).toEqual(14);
        expect(MGPNode.NB_NODE_CREATED).toEqual(15);
    });
    it('IA(depth=4) should create exactly 28 descendant and calculate the same amount of time their value', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        rules.node.findBestMoveAndSetDepth(4);
        expect(rules.node.countDescendants()).toEqual(28);
        expect(MGPNode.NB_NODE_CREATED).toEqual(29, 'Only 29 nodes should have been created');
        expect(MinimaxTestingRules.GET_BOARD_VALUE_CALL_COUNT)
            .toEqual(MGPNode.NB_NODE_CREATED - 1, 'Only 28 nodes should had their own value calculated');
        expect(MinimaxTestingRules.GET_LIST_MOVES_CALL_COUNT).toEqual(MGPNode.NB_NODE_CREATED - 14);
    });
    it('IA(depth=5) should create exactly 48 child', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        rules.node.findBestMoveAndSetDepth(5);
        expect(rules.node.countDescendants()).toEqual(48);
        expect(MGPNode.NB_NODE_CREATED).toEqual(49);
    });
    it('IA(depth=6) should create exactly 68 child', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        rules.node.findBestMoveAndSetDepth(6);
        expect(rules.node.countDescendants()).toEqual(68);// 2, 6, 14, 28, 48, 68
        expect(MGPNode.NB_NODE_CREATED).toEqual(69);
    });
    it('IA(depth=7) cannot go further than the end game', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_0;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        rules.node.findBestMoveAndSetDepth(7);
        expect(rules.node.countDescendants()).toEqual(68);// 2, 6, 14, 28, 48, 68
        expect(MGPNode.NB_NODE_CREATED).toEqual(69);
    });
});
