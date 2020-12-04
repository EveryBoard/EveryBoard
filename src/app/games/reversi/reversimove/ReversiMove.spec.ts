import { ReversiRules } from "../reversirules/ReversiRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { ReversiMove } from "./ReversiMove";
import { ReversiPartSlice } from "../ReversiPartSlice";

describe('ReversiMove', () => {

    it('ReversiMove.encode and ReversiMove.decode should be reversible', () => {
        const rules: ReversiRules = new ReversiRules(ReversiPartSlice);
        const moves: MGPMap<ReversiMove, ReversiPartSlice> = rules.getListMoves(rules.node);
        moves.put(ReversiMove.PASS, new ReversiPartSlice([], 0));
        for (let i = 0; i < moves.size(); i++) {
            const move: ReversiMove = moves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: ReversiMove = ReversiMove.decode(encodedMove);
            const reEncodedMove: number = decodedMove.encode();
            expect(reEncodedMove).toEqual(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should delegate to static method decode', () => {
        const testMove: ReversiMove = new ReversiMove(1, 1);
        spyOn(ReversiMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(ReversiMove.decode).toHaveBeenCalledTimes(1);
    });
});