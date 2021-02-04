import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { EpaminondasMove } from '../epaminondas-move/EpaminondasMove';
import { EpaminondasPartSlice } from '../epaminondas-part-slice/EpaminondasPartSlice';
import { EpaminondasRules } from './EpaminondasRules';

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
        expect(rules.node.findBestMoveAndSetDepth(1).move).toEqual(new EpaminondasMove(4, 9, 2, 1, Direction.UP));
    });
});
