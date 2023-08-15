/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { LinesOfActionMoveGenerator } from '../LinesOfActionMoveGenerator';
import { LinesOfActionNode } from '../LinesOfActionRules';
import { LinesOfActionState } from '../LinesOfActionState';

describe('LinesOfActionMoveGenerator', () => {

    let moveGenerator: LinesOfActionMoveGenerator;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        moveGenerator = new LinesOfActionMoveGenerator();
    });
    it('should have 36 moves on the initial state', () => {
        const state: LinesOfActionState = LinesOfActionState.getInitialState();
        const node: LinesOfActionNode = new LinesOfActionNode(state);
        expect(moveGenerator.getListMoves(node).length).toBe(6 * 3 * 2);
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
        expect(moveGenerator.getListMoves(node).length).toBe(0);
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
        expect(moveGenerator.getListMoves(node).length).toBe(0);
    });
});
