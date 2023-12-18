/* eslint-disable max-lines-per-function */
import { CoerceoState } from '../CoerceoState';
import { CoerceoNode } from '../CoerceoRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { CoerceoMoveGenerator } from '../CoerceoMoveGenerator';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

fdescribe('CoerceoMoveGenerator', () => {

    let moveGenerator: CoerceoMoveGenerator;

    beforeEach(() => {
        moveGenerator = new CoerceoMoveGenerator();
    });
    it('should generate all moves', () => {
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
        const state: CoerceoState = new CoerceoState(board, 0, PlayerMap.of(2, 0), PlayerMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);
        expect(moveGenerator.getListMoves(node).length).toBe(3);
    });
});
