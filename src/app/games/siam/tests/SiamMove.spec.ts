import { SiamRules, SiamNode } from '../SiamRules';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { SiamMove } from '../SiamMove';
import { SiamPartSlice } from '../SiamPartSlice';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { SiamPiece } from '../SiamPiece';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

describe('SiamMove', () => {
    const _: number = SiamPiece.EMPTY.value;
    const M: number = SiamPiece.MOUNTAIN.value;

    const D: number = SiamPiece.WHITE_DOWN.value;

    it('SiamMove.encode and SiamMove.decode should be reversible', () => {
        const board: number[][] = [
            [_, _, D, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const move: SiamMove = new SiamMove(0, 0, MGPOptional.of(Orthogonal.DOWN), Orthogonal.UP);
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const node: SiamNode = new MGPNode(null, move, slice, 0);
        const rules: SiamRules = new SiamRules(SiamPartSlice);
        const moves: MGPMap<SiamMove, SiamPartSlice> = rules.getListMoves(node);
        for (let i = 0; i < moves.size(); i++) {
            const move: SiamMove = moves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: SiamMove = SiamMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });

    it('should delegate decoding to static method', () => {
        const testMove: SiamMove = new SiamMove(-1, 0, MGPOptional.of(Orthogonal.RIGHT), Orthogonal.RIGHT);
        spyOn(SiamMove, 'decode').and.callThrough();
        testMove.decode(testMove.encode());
        expect(SiamMove.decode).toHaveBeenCalledTimes(1);
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
            new SiamMove(2, 2, MGPOptional.of(Orthogonal.UP), null);
        }).toThrowError('Landing orientation must be set.');
        expect(() => {
            new SiamMove(2, 2, null, Orthogonal.UP);
        }).toThrowError('Move Direction must be set (even if optional).');
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
