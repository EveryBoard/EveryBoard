import { MinimaxTestingRules } from '../MinimaxTestingRules';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';
import { MinimaxTestingMinimax } from '../MinimaxTestingMinimax';

describe('MinimaxTestingMove', () => {
    it('MinimaxTestingMove.encode and MinimaxTestingMove.decode should be reversible', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const minimax: MinimaxTestingMinimax = new MinimaxTestingMinimax('MinimaxTestingMinimax');
        const firstTurnMoves: MinimaxTestingMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            const encodedMove: number = move.encode();
            const decodedMove: MinimaxTestingMove = MinimaxTestingMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });

    it('should delegate to static method decode', () => {
        const testMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
        spyOn(MinimaxTestingMove, 'decode').and.callThrough();

        testMove.decode(testMove.encode());

        expect(MinimaxTestingMove.decode).toHaveBeenCalledTimes(1);
    });
});
