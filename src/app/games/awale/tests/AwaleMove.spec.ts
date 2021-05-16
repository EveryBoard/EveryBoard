import { AwaleRules } from '../AwaleRules';
import { AwaleMinimax } from '../AwaleMinimax';
import { AwaleMove } from '../AwaleMove';
import { AwalePartSlice } from '../AwalePartSlice';

describe('AwaleMove', () => {
    it('AwaleMove.encode and AwaleMove.decode should be reversible', () => {
        const rules: AwaleRules = new AwaleRules(AwalePartSlice);
        const minimax: AwaleMinimax = new AwaleMinimax('AwaleMinimax');
        const firstTurnMoves: AwaleMove[] = minimax.getListMoves(rules.node);
        for (const move of firstTurnMoves) {
            const encodedMove: number = move.encode();
            const decodedMove: AwaleMove = AwaleMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('Should delegate to static method decode', () => {
        const testMove: AwaleMove = new AwaleMove(1, 1);
        spyOn(AwaleMove, 'decode').and.callThrough();

        testMove.decode(testMove.encode());

        expect(AwaleMove.decode).toHaveBeenCalledTimes(1);
    });
    it('Should override equals correctly', () => {
        const move: AwaleMove = new AwaleMove(0, 0);
        const other: AwaleMove = new AwaleMove(0, 1);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(other)).toBeFalse();
    });
});
