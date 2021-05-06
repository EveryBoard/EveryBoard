import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasPartSlice } from '../EpaminondasPartSlice';
import { EpaminondasRules } from '../EpaminondasRules';
import { expectFirstStateToBeBetterThanSecond } from 'src/app/utils/TestUtils.spec';

describe('EpaminondasRules - Minimax:', () => {
    let rules: EpaminondasRules;
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    beforeEach(() => {
        rules = new EpaminondasRules(EpaminondasPartSlice);
    });
    it('Should propose 114 moves at first turn', () => {
        expect(rules.getListMoves(rules.node).size()).toBe(114);
    });
    it('Should consider possible capture the best move', () => {
        const board: NumberTable = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const slice: EpaminondasPartSlice = new EpaminondasPartSlice(board, 0);
        rules.node = new MGPNode(null, null, slice, 0);
        const capture: EpaminondasMove = new EpaminondasMove(4, 9, 2, 1, Direction.UP);
        const bestMove: EpaminondasMove = rules.node.findBestMove(1).move;
        expect(bestMove).toEqual(capture);
    });
    xit('Should consider two neighboor piece better than two separated piece', () => {
        const weakerState: EpaminondasPartSlice = new EpaminondasPartSlice([
            [_, _, _, _, _, _, _, _, _, X, _, X, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _, _, _, _, _, _],
        ], 0);
        const strongerState: EpaminondasPartSlice = new EpaminondasPartSlice([
            [_, _, _, _, _, _, _, _, _, X, X, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _, _, _, _, _, _],
        ], 0);
        expectFirstStateToBeBetterThanSecond(weakerState, null, strongerState, null, rules);
    });
});
