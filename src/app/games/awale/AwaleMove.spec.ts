import { AwaleRules } from "./AwaleRules";
import { MGPMap } from "src/app/collectionlib/MGPMap";
import { AwaleMove } from "./AwaleMove";
import { AwalePartSlice } from "./AwalePartSlice";

describe('AwaleMove', () => {

    it('AwaleMove.encode and AwaleMove.decode should be reversible', () => {
        const rules: AwaleRules = new AwaleRules();
        const firstTurnMoves: MGPMap<AwaleMove, AwalePartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: AwaleMove = firstTurnMoves.get(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: AwaleMove = AwaleMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
});