import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { LinesOfActionMinimax } from '../LinesOfActionMinimax';
import { LinesOfActionNode, LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';

describe('LinesOfActionMinimax', () => {

    let minimax: LinesOfActionMinimax;
    const X: PlayerOrNone = PlayerOrNone.ZERO;
    const O: PlayerOrNone = PlayerOrNone.ONE;
    const _: PlayerOrNone = PlayerOrNone.NONE;

    beforeEach(() => {
        const rules: LinesOfActionRules = new LinesOfActionRules(LinesOfActionState);
        minimax = new LinesOfActionMinimax(rules, 'Lines Of Action Minimax');
    });
    it('should have 36 moves on the initial state', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(minimax.getListMoves(node).length).toBe(6 * 3 * 2);
    });
    it('should have 0 moves on a victory state', () => {
        const board: Table<PlayerOrNone> = [
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
