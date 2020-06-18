import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { EncapsuleRules } from "../encapsulerules/EncapsuleRules";
import { EncapsuleMove } from "./EncapsuleMove";
import { EncapsulePartSlice } from "../EncapsulePartSlice";

describe('EncapsuleMove', () => {

    it('EncapsuleMove.encode and EncapsuleMove.decode should be reversible', () => {
        const rules: EncapsuleRules = new EncapsuleRules();
        const firstTurnMoves: MGPMap<EncapsuleMove, EncapsulePartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: EncapsuleMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: EncapsuleMove = EncapsuleMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
});