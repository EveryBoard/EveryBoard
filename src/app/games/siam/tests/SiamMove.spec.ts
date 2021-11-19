import { SiamNode, SiamRules } from '../SiamRules';
import { SiamMinimax } from '../SiamMinimax';
import { SiamMove } from '../SiamMove';
import { SiamState } from '../SiamState';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { SiamPiece } from '../SiamPiece';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { Table } from 'src/app/utils/ArrayUtils';

describe('SiamMove', () => {

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;

    const D: SiamPiece = SiamPiece.WHITE_DOWN;

    it('SiamMove.encoder should be correct', () => {
        const board: Table<SiamPiece> = [
            [_, _, D, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const move: SiamMove = new SiamMove(0, 0, MGPOptional.of(Orthogonal.DOWN), Orthogonal.UP);
        const state: SiamState = new SiamState(board, 0);
        const node: SiamNode = new SiamNode(state, MGPOptional.empty(), MGPOptional.of(move));
        const rules: SiamRules = new SiamRules(SiamState);
        const minimax: SiamMinimax = new SiamMinimax(rules, 'SiamMinimax');
        const moves: SiamMove[] = minimax.getListMoves(node);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeCorrect(SiamMove.encoder, move);
        }
    });
    it('Should force move to end inside the board', () => {
        expect(() => {
            new SiamMove(-1, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.UP);
        }).toThrowError('SiamMove should end or start on the board: SiamMove(-1, 2, UP, UP).');
    });

    it('Should forbid rotation outside the board', () => {
        expect(() => {
            new SiamMove(-1, 2, MGPOptional.empty(), Orthogonal.UP);
        }).toThrowError('Cannot rotate piece outside the board: SiamMove(-1, 2, -, UP).');
    });

    it('Should throw during invalid SiamMove creation', () => {
        expect(() => {
            new SiamMove(0, 0, MGPOptional.of(Orthogonal.UP), Orthogonal.DOWN);
        }).toThrowError('SiamMove should have moveDirection and landingOrientation matching when a piece goes out of the board: SiamMove(0, 0, UP, DOWN).');
    });

    it('Should override correctly equality', () => {
        const moveA: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
        const twin: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
        const neighboor: SiamMove = new SiamMove(3, 3, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
        const cousin: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonal.DOWN), Orthogonal.RIGHT);
        const stranger: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.LEFT);
        expect(moveA.equals(moveA)).toBeTrue();
        expect(moveA.equals(twin)).toBeTrue();
        expect(moveA.equals(neighboor)).toBeFalse();
        expect(moveA.equals(cousin)).toBeFalse();
        expect(moveA.equals(stranger)).toBeFalse();
    });
});
