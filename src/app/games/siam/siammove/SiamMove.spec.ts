import { SiamRules } from "../siamrules/SiamRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { SiamMove } from "./SiamMove";
import { SiamPartSlice } from "../SiamPartSlice";

describe('SiamMove', () => {

    it('SiamMove.encode and SiamMove.decode should be reversible', () => {
        const rules: SiamRules = new SiamRules();
        const firstTurnMoves: MGPMap<SiamMove, SiamPartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: SiamMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: SiamMove = SiamMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
});