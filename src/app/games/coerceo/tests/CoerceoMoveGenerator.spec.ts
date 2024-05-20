/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { CoerceoState } from '../CoerceoState';
import { CoerceoConfig, CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { CoerceoMoveGenerator } from '../CoerceoMoveGenerator';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

fdescribe('CoerceoMoveGenerator', () => {

    let moveGenerator: CoerceoMoveGenerator;
    const defaultConfig: MGPOptional<CoerceoConfig> = CoerceoRules.get().getDefaultRulesConfig();

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
        const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(2, 0), PlayerNumberMap.of(0, 0));
        const node: CoerceoNode = new CoerceoNode(state);
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(3);
    });

});
