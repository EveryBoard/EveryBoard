import { QuartoRules } from "../quartorules/QuartoRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { QuartoMove } from "./QuartoMove";
import { QuartoPartSlice } from "../QuartoPartSlice";

describe('QuartoMove', () => {

    it('QuartoMove.encode and QuartoMove.decode should be reversible', () => {
        const rules: QuartoRules = new QuartoRules(QuartoPartSlice);
        const firstTurnMoves: MGPMap<QuartoMove, QuartoPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: QuartoMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: QuartoMove = QuartoMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: QuartoMove = new QuartoMove(1, 1, 1);
        spyOn(QuartoMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(QuartoMove.decode).toHaveBeenCalledTimes(1);
    });
});