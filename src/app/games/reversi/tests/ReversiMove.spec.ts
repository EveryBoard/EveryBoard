import { ReversiMinimax, ReversiRules } from '../ReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiPartSlice } from '../ReversiPartSlice';

describe('ReversiMove', () => {
    it('ReversiMove.encode and ReversiMove.decode should be reversible', () => {
        const rules: ReversiRules = new ReversiRules(ReversiPartSlice);
        const minimax: ReversiMinimax = new ReversiMinimax('ReversiMinimax');
        const moves: ReversiMove[] = minimax.getListMoves(rules.node);
        moves.push(ReversiMove.PASS);
        for (const move of moves) {
            const encodedMove: number = move.encode();
            const decodedMove: ReversiMove = ReversiMove.decode(encodedMove);
            const reEncodedMove: number = decodedMove.encode();
            expect(reEncodedMove).toEqual(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: ReversiMove = new ReversiMove(1, 1);
        spyOn(ReversiMove, 'decode').and.callThrough();

        testMove.decode(testMove.encode());

        expect(ReversiMove.decode).toHaveBeenCalledTimes(1);
    });
});
