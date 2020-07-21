import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { EncapsuleRules } from "../encapsulerules/EncapsuleRules";
import { EncapsuleMove } from "./EncapsuleMove";
import { EncapsulePartSlice } from "../EncapsulePartSlice";
import { Coord } from "src/app/jscaip/Coord";

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
    it('Method decode should delegate to static method decode', () => {
        const testMove: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2));
        spyOn(EncapsuleMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(EncapsuleMove.decode).toHaveBeenCalledTimes(1);
    });
});