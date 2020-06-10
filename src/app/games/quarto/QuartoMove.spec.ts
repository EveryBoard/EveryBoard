import { QuartoRules } from "./QuartoRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { QuartoMove } from "./QuartoMove";
import { QuartoPartSlice } from "./QuartoPartSlice";

describe('QuartoMove', () => {

    it('QuartoMove.encode and QuartoMove.decode should be reversible', () => {
        const rules: QuartoRules = new QuartoRules();
        const firstTurnMoves: MGPMap<QuartoMove, QuartoPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: QuartoMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: QuartoMove = QuartoMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
});