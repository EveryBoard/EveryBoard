import {MinimaxTestingRules} from './MinimaxTestingRules';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';
import { MinimaxTestingMove } from '../minimaxtestingmove/MinimaxTestingMove';
import { MNode } from 'src/app/jscaip/MNode';

describe('MinimaxTestingRules', () => {

    beforeEach(() => {
        MNode.NB_NODE_CREATED = 0;
    });
    it('should be created', () => {
        expect(new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_1)).toBeTruthy();
    });
    it('should be a victory of second player', () => {
        const part: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_1);
        expect(part.choose(MinimaxTestingMove.RIGHT)).toBeTruthy('Move should be legal');
        expect(part.getBoardValue(part.node.move, part.node.gamePartSlice)).toEqual(Number.MAX_SAFE_INTEGER);
    });
    it('IA should avoid loosing 4 move in a row', () => {
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_1);
        let bestMove: MinimaxTestingMove;
        for (let i = 1; i<5; i++) {
            bestMove = part.node.findBestMoveAndSetDepth(1).move;
            part.choose(bestMove);
            expect(part.getBoardValue(part.node.move, part.node.gamePartSlice)).toEqual(i);
        }
    });
    it('IA should not create sister-node to winning-node', () => {
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_1);
        let bestMove: MinimaxTestingMove = part.node.findBestMoveAndSetDepth(5).move;
        expect(bestMove).toEqual(MinimaxTestingMove.DOWN);
        expect(part.node.getHopedValue()).toEqual(Number.MIN_SAFE_INTEGER);
        expect(MNode.NB_NODE_CREATED).toEqual(10);
    });
    it('IA(depth=1) should create exactly 2 child at each turn before reaching the border', () => {
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);
        let bestMove: MinimaxTestingMove;
        for (let i=1; i<=3; i++) {
            MNode.NB_NODE_CREATED = 0;
            bestMove = part.node.findBestMoveAndSetDepth(1).move;
            part.choose(bestMove);
            expect(MNode.NB_NODE_CREATED).toEqual(2);
        }
    });
    it('IA(depth=2) should create not recalculate already created node', () => {
        MNode.NB_NODE_CREATED = 0;
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);
        let boardValue: number;
        let bestMove: MinimaxTestingMove;
        for (let i = 0; i<6; i++) {
            bestMove = part.node.findBestMoveAndSetDepth(2).move;
            boardValue = part.getBoardValue(part.node.move, part.node.gamePartSlice);
            part.choose(bestMove);
            expect(MNode.NB_NODE_CREATED).toEqual(boardValue);
            MNode.NB_NODE_CREATED = 0;
        }
    });
    it('IA(depth=3) should create exactly 14 descendant', () => {
        MNode.NB_NODE_CREATED = 0;
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);
        part.node.findBestMoveAndSetDepth(3);
        expect(part.node.countDescendants()).toEqual(14);
        expect(MNode.NB_NODE_CREATED).toEqual(15);
    });
    it('IA(depth=4) should create exactly 28 descendant and calculate the same amount of time their value', () => {
        MNode.NB_NODE_CREATED = 0;
        MinimaxTestingRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        MinimaxTestingRules.GET_LIST_MOVES_CALL_COUNT = 0;
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);
        part.node.findBestMoveAndSetDepth(4);
        expect(part.node.countDescendants()).toEqual(28);
        expect(MNode.NB_NODE_CREATED).toEqual(29, "Only 29 nodes should have been created");
        expect(MinimaxTestingRules.GET_BOARD_VALUE_CALL_COUNT).toEqual(MNode.NB_NODE_CREATED - 1, "Only 28 nodes should had their own value calculated");
        expect(MinimaxTestingRules.GET_LIST_MOVES_CALL_COUNT).toEqual(MNode.NB_NODE_CREATED - 14);
    });
    it('IA(depth=5) should create exactly 48 child', () => {
        MNode.NB_NODE_CREATED = 0;
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);
        part.node.findBestMoveAndSetDepth(5);
        expect(part.node.countDescendants()).toEqual(48);
        expect(MNode.NB_NODE_CREATED).toEqual(49);
    });
    it('IA(depth=6) should create exactly 68 child', () => {
        MNode.NB_NODE_CREATED = 0;
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);
        part.node.findBestMoveAndSetDepth(6);
        expect(part.node.countDescendants()).toEqual(68);// 2, 6, 14, 28, 48, 68
        expect(MNode.NB_NODE_CREATED).toEqual(69);
    });
    it('IA(depth=7) cannot go further than the end game', () => {
        MNode.NB_NODE_CREATED = 0;
        const part = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);
        part.node.findBestMoveAndSetDepth(7);
        expect(part.node.countDescendants()).toEqual(68);// 2, 6, 14, 28, 48, 68
        expect(MNode.NB_NODE_CREATED).toEqual(69);
    });
});