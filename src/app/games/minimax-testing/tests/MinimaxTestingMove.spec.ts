import { MinimaxTestingRules } from '../MinimaxTestingRules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MinimaxTestingMove } from '../MinimaxTestingMove';
import { MinimaxTestingPartSlice } from '../MinimaxTestingPartSlice';

describe('MinimaxTestingMove', () => {
    it('MinimaxTestingMove.encode and MinimaxTestingMove.decode should be reversible', () => {
        MinimaxTestingPartSlice.initialBoard = MinimaxTestingPartSlice.BOARD_1;
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        const firstTurnMoves: MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> = rules.getListMoves(rules.node);
        for (let i: number = 0; i < firstTurnMoves.size(); i++) {
            const move: MinimaxTestingMove = firstTurnMoves.getByIndex(i).key;
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
