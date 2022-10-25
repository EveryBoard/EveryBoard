/* eslint-disable max-lines-per-function */
import { SiamNode, SiamRules } from '../SiamRules';
import { SiamMinimax } from '../SiamMinimax';
import { SiamMove } from '../SiamMove';
import { SiamState } from '../SiamState';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { SiamPiece } from '../SiamPiece';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

describe('SiamMove', () => {

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;

    const D: SiamPiece = SiamPiece.LIGHT_DOWN;

    it('encoder should be correct', () => {
        const board: Table<SiamPiece> = [
            [_, _, D, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const move: SiamMove = SiamMove.of(0, 0, MGPOptional.of(Orthogonal.DOWN), Orthogonal.UP).get();
        const state: SiamState = new SiamState(board, 0);
        const node: SiamNode = new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move));
        const rules: SiamRules = SiamRules.get();
        const minimax: SiamMinimax = new SiamMinimax(rules, 'SiamMinimax');
        const moves: SiamMove[] = minimax.getListMoves(node);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeCorrect(SiamMove.encoder, move);
        }
    });
    it('should ensure move ends inside the board', () => {
        const move: MGPFallible<SiamMove> = SiamMove.of(-1, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        expect(move).toEqual(MGPFallible.failure('SiamMove should end or start on the board: SiamMove(-1, 2, UP, UP)'));
    });

    it('should forbid rotation outside the board', () => {
        const move: MGPFallible<SiamMove> = SiamMove.of(-1, 2, MGPOptional.empty(), Orthogonal.UP);
        expect(move).toEqual(MGPFallible.failure('Cannot rotate piece outside the board: SiamMove(-1, 2, -, UP)'));
    });

    it('should forbid invalid SiamMove creation', () => {
        const move: MGPFallible<SiamMove> = SiamMove.of(0, 0, MGPOptional.of(Orthogonal.UP), Orthogonal.DOWN);
        expect(move).toEqual(MGPFallible.failure('SiamMove should have moveDirection and landingOrientation matching when a piece goes out of the board: SiamMove(0, 0, UP, DOWN)'));
    });

    it('should override equals correctly', () => {
        const moveA: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT).get();
        const twin: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT).get();
        const neighbor: SiamMove = SiamMove.of(3, 3, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT).get();
        const cousin: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.DOWN), Orthogonal.RIGHT).get();
        const stranger: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.LEFT).get();
        expect(moveA.equals(moveA)).toBeTrue();
        expect(moveA.equals(twin)).toBeTrue();
        expect(moveA.equals(neighbor)).toBeFalse();
        expect(moveA.equals(cousin)).toBeFalse();
        expect(moveA.equals(stranger)).toBeFalse();
    });
});
