import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { LinesOfActionMinimax } from '../LinesOfActionMinimax';
import { LinesOfActionNode, LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';

describe('LinesOfActionMinimax', () => {

    let rules: LinesOfActionRules;
    let minimax: LinesOfActionMinimax;

    const X: Player = Player.ZERO;
    const O: Player = Player.ONE;
    const _: Player = Player.NONE;

    beforeEach(() => {
        rules = new LinesOfActionRules(LinesOfActionState);
        minimax = new LinesOfActionMinimax(rules, 'LinesOfActionMinimax');
    });
    it('should have 36 moves on the initial state', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(minimax.getListMoves(node).length).toBe(6 * 3 * 2);
    });
    it('should have 0 moves on a victory state', () => {
        const board: Table<Player> = [
            [_, _, _, _, _, _, _, _],
            [O, _, _, _, X, _, _, O],
            [_, _, X, X, O, _, _, _],
            [_, _, _, X, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(minimax.getListMoves(node).length).toBe(0);
    });
});
