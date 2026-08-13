/* eslint-disable max-lines-per-function */
import { PlayerNumberMap } from '@everyboard/games';

import { FourStatePiece } from '../../../jscaip/FourStatePiece';
import { CoerceoOrderedMoveGenerator } from '../CoerceoOrderedMoveGenerator';
import { CoerceoConfig, CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { CoerceoState } from '../CoerceoState';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('CoerceoOrderedMoveGenerator', () => {

    let moveGenerator: CoerceoOrderedMoveGenerator;
    const defaultConfig: CoerceoConfig = CoerceoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new CoerceoOrderedMoveGenerator();
    });

    it('should still generate all moves number of moves', () => {
        const board: FourStatePiece[][] = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(2, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(3);
    });

    it('should generate all moves in case of capture on the edge', () => {
        const board: FourStatePiece[][] = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, X, _, X],
            [N, N, N, N, N, N, N, N, N, N, N, N, _, _, O],
        ];
        const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(18, 17));
        const node: CoerceoNode = new CoerceoNode(state);
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(2);
    });

});
