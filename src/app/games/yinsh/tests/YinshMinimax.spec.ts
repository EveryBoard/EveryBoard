import { YinshBoard } from '../YinshBoard';
import { YinshGameState } from '../YinshGameState';
import { YinshMinimax } from '../YinshMinimax';
import { YinshPiece } from '../YinshPiece';
import { YinshNode, YinshRules } from '../YinshRules';

describe('YinshMinimax', () => {
    const _: YinshPiece = YinshPiece.EMPTY;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const b: YinshPiece = YinshPiece.MARKER_ONE;
    const B: YinshPiece = YinshPiece.RING_ONE;

    let rules: YinshRules;

    let minimax: YinshMinimax;

    beforeEach(() => {
        rules = new YinshRules(YinshGameState);
        minimax = new YinshMinimax(rules, 'YinshMinimax');
    });

    it('should have 85 moves on the initial state', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(85);
    });
    fit('should have 18 moves on a specific state after the placement phase', () => {
        const board: YinshBoard = YinshBoard.of([
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, A, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
        ]);
        const state: YinshGameState = new YinshGameState(board, [0, 0], 10);

        rules.node = new YinshNode(null, null, state);
        expect(minimax.getListMoves(rules.node).length).toBe(18);
    });
});
