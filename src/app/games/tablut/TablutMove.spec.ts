import { TablutRules } from "./TablutRules";
import { TablutMove } from "./TablutMove";
import { MGPMap } from "src/app/collectionlib/MGPMap";
import { TablutPartSlice } from "./TablutPartSlice";

describe('TablutMove', () => {

    it('TablutMove.encode and TablutMove.decode should be reversible', () => {
        const rules: TablutRules = new TablutRules();
        const firstTurnMoves: MGPMap<TablutMove, TablutPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: TablutMove = firstTurnMoves.get(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: TablutMove = TablutMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
});