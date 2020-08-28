import { MinimaxTestingRules } from "../minimaxtestingrules/MinimaxTestingRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { MinimaxTestingMove } from "./MinimaxTestingMove";
import { MinimaxTestingPartSlice } from "../MinimaxTestingPartSlice";

describe('MinimaxTestingMove', () => {

    it('MinimaxTestingMove.encode and MinimaxTestingMove.decode should be reversible', () => {
        const rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_1);
        const firstTurnMoves: MGPMap<MinimaxTestingMove, MinimaxTestingPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: MinimaxTestingMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: MinimaxTestingMove = MinimaxTestingMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });

    it('Method decode should delegate to static method decode', () => {
        const testMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
        spyOn(MinimaxTestingMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(MinimaxTestingMove.decode).toHaveBeenCalledTimes(1);
    });
});