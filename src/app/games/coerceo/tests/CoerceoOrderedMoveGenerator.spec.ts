/* eslint-disable max-lines-per-function */
import { CoerceoState } from '../CoerceoState';
import { CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { CoerceoOrderedMoveGenerator } from '../CoerceoOrderedMoveGenerator';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('CoerceoOrderedMoveGenerator', () => {

    let moveGenerator: CoerceoOrderedMoveGenerator;
    const defaultConfig: MGPOptional<EmptyRulesConfig> = CoerceoRules.get().getDefaultRulesConfig();

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
        const state: CoerceoState = new CoerceoState(board, 0, [2, 0], [0, 0]);
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
        const state: CoerceoState = new CoerceoState(board, 1, [0, 0], [18, 17]);
        const node: CoerceoNode = new CoerceoNode(state);
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(2);
    });

});
