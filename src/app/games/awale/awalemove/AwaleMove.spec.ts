import { AwaleRules } from "../awalerules/AwaleRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { AwaleMove } from "./AwaleMove";
import { AwalePartSlice } from "../AwalePartSlice";

describe('AwaleMove', () => {

    it('AwaleMove.encode and AwaleMove.decode should be reversible', () => {
        const rules: AwaleRules = new AwaleRules(AwalePartSlice);
        const firstTurnMoves: MGPMap<AwaleMove, AwalePartSlice> = rules.getListMoves(rules.node);
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: AwaleMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: AwaleMove = AwaleMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: AwaleMove = new AwaleMove(1, 1);
        spyOn(AwaleMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(AwaleMove.decode).toHaveBeenCalledTimes(1);
    });
});