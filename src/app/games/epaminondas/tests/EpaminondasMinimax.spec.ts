import { Table } from 'src/app/utils/ArrayUtils';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasRules } from '../EpaminondasRules';
import { EpaminondasMinimax } from '../EpaminondasMinimax';
import { expectSecondStateToBeBetterThanFirst } from 'src/app/utils/tests/TestUtils.spec';

describe('EpaminondasMinimax:', () => {

    let rules: EpaminondasRules;
    let minimax: EpaminondasMinimax;
    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    beforeEach(() => {
        rules = new EpaminondasRules(EpaminondasState);
        minimax = new EpaminondasMinimax(rules, 'EpaminondasMinimax');
    });
    it('Should propose 114 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(114);
    });
    it('Should consider possible capture the best move', () => {
        const board: Table<Player> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        rules.node = new MGPNode(null, null, state);
        const capture: EpaminondasMove = new EpaminondasMove(4, 9, 2, 1, Direction.UP);
        const bestMove: EpaminondasMove = rules.node.findBestMove(1, minimax);
        expect(bestMove).toEqual(capture);
    });
    it('Should consider two neighboor piece better than two separated piece', () => {
        const weakerState: EpaminondasState = new EpaminondasState([
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
        const strongerState: EpaminondasState = new EpaminondasState([
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _],
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
        expectSecondStateToBeBetterThanFirst(weakerState, null, strongerState, null, minimax);
    });
});
