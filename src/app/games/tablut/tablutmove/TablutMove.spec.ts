import { TablutRules } from "../tablutrules/TablutRules";
import { TablutMove } from "./TablutMove";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { TablutPartSlice } from "../TablutPartSlice";
import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";

describe('TablutMove', () => {

    beforeAll(() => {
        TablutRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || TablutRules.VERBOSE;
    });
    it('TablutMove.encode and TablutMove.decode should be reversible', () => {
        const rules: TablutRules = new TablutRules();
        const firstTurnMoves: MGPMap<TablutMove, TablutPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: TablutMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: TablutMove = TablutMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
});