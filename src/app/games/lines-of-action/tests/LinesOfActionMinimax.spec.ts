import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { LinesOfActionMinimax } from '../LinesOfActionMinimax';
import { LinesOfActionNode, LinesOfActionRules } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';

describe('LinesOfActionMinimax', () => {

    let minimax: LinesOfActionMinimax;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        const rules: LinesOfActionRules = new LinesOfActionRules(LinesOfActionState);
        minimax = new LinesOfActionMinimax(rules, 'Lines Of Action Minimax');
    });
    it('should have 36 moves on the initial state', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(minimax.getListMoves(node).length).toBe(6 * 3 * 2);
    });
    it('should have 0 moves on a victory state (for Player.ZERO)', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [X, _, _, _, O, _, _, X],
            [_, _, O, O, X, _, _, _],
            [_, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        const state: LinesOfActionState = new LinesOfActionState(board, 0);
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(minimax.getListMoves(node).length).toBe(0);
    });
    it('should have 0 moves on a victory state (for Player.ONE)', () => {
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
        const state: LinesOfActionState = new LinesOfActionState(board, 1);
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(minimax.getListMoves(node).length).toBe(0);
    });
});
