import { QuartoMinimax, QuartoRules } from '../QuartoRules';
import { QuartoMove } from '../QuartoMove';
import { QuartoPartSlice } from '../QuartoPartSlice';
import { QuartoPiece } from '../QuartoPiece';

describe('QuartoMove', () => {
    it('QuartoMove.encode and QuartoMove.decode should be reversible', () => {
        const rules: QuartoRules = new QuartoRules(QuartoPartSlice);
        const minimax: QuartoMinimax = new QuartoMinimax('QuartoMinimax');
        const firstTurnMoves: QuartoMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            const encodedMove: number = move.encode();
            const decodedMove: QuartoMove = QuartoMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: QuartoMove = new QuartoMove(1, 1, QuartoPiece.fromInt(1));
        spyOn(QuartoMove, 'decode').and.callThrough();

        testMove.decode(testMove.encode());

        expect(QuartoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should refuse null piece', () => {
        expect(() => new QuartoMove(0, 0, null)).toThrowError('Piece to give can\'t be null.');
    });
    it('should override toString and equals correctly', () => {
        const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.AAAB);
        const secondMove: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);
        const thirdMove: QuartoMove = new QuartoMove(1, 1, QuartoPiece.AAAA);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(secondMove)).toBeFalse();
        expect(move.equals(thirdMove)).toBeFalse();
        expect(move.toString()).toEqual('QuartoMove(1, 1, 1)');
    });
});
