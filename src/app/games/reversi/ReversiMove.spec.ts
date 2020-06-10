import { ReversiRules } from "./ReversiRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { ReversiMove } from "./ReversiMove";
import { ReversiPartSlice } from "./ReversiPartSlice";

describe('ReversiMove', () => {

    it('ReversiMove.encode and ReversiMove.decode should be reversible', () => {
        const rules: ReversiRules = new ReversiRules();
        const firstTurnMoves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: ReversiMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: ReversiMove = ReversiMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
});