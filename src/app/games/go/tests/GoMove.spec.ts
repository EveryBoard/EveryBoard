import { GoRules } from '../GoRules';
import { GoMinimax } from "../GoMinimax";
import { GoPartSlice } from '../GoPartSlice';
import { GoMove } from '../GoMove';

describe('GoMove', () => {
    it('GoMove.encode and GoMove.decode should be reversible', () => {
        const rules: GoRules = new GoRules(GoPartSlice);
        const minimax: GoMinimax = new GoMinimax('GoMinimax');
        const firstTurnMoves: GoMove[] = minimax.getListMoves(rules.node);
        firstTurnMoves.push(GoMove.PASS);
        firstTurnMoves.push(GoMove.ACCEPT);
        for (let i: number = 0; i < firstTurnMoves.length; i++) {
            const move: GoMove = firstTurnMoves[i];
            const encodedMove: number = move.encode();
            const decodedMove: GoMove = GoMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: GoMove = new GoMove(1, 1);
        spyOn(GoMove, 'decode').and.callThrough();

        testMove.decode(testMove.encode());

        expect(GoMove.decode).toHaveBeenCalledTimes(1);
    });
});
