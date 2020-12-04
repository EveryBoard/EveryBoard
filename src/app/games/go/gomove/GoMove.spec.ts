import { GoRules } from "../gorules/GoRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { GoMove } from "./GoMove";
import { GoPartSlice } from "../GoPartSlice";

describe('GoMove', () => {

    it('GoMove.encode and GoMove.decode should be reversible', () => {
        const rules: GoRules = new GoRules(GoPartSlice);
        const firstTurnMoves: MGPMap<GoMove, GoPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: GoMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: GoMove = GoMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: GoMove = new GoMove(1, 1);
        spyOn(GoMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(GoMove.decode).toHaveBeenCalledTimes(1);
    });
});