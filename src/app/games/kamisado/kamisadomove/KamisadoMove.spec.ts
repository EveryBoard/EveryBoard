import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { Coord } from "src/app/jscaip/coord/Coord";
import { KamisadoBoard } from "../KamisadoBoard";
import { KamisadoPartSlice } from "../KamisadoPartSlice";
import { KamisadoRules } from "../kamisadorules/KamisadoRules";
import { KamisadoMove } from "./KamisadoMove";

describe('KamisadoMove', () => {

    it('should toString in a readable way', () => {
        expect((KamisadoMove.of(new Coord(0, 0), new Coord(1, 5))).toString()).toEqual("KamisadoMove((0, 0)->(1, 5))");
        expect(KamisadoMove.PASS.toString()).toEqual("KamisadoMove(PASS)");
    });
    it('should correctly encode and decode all moves', () => {
        const rules: KamisadoRules = new KamisadoRules(KamisadoPartSlice);
        const firstTurnMoves: MGPMap<KamisadoMove, KamisadoPartSlice> = rules.getListMoves(rules.node);
        for (const move of firstTurnMoves.listKeys()) {
            const encodedMove: number = move.encode();
            const decodedMove: KamisadoMove = KamisadoMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('should correctly encode and decode PASS', () => {
        const encodedMove: number = KamisadoMove.PASS.encode();
        const decodedMove: KamisadoMove = KamisadoMove.decode(encodedMove);
        expect(decodedMove).toEqual(KamisadoMove.PASS);
    });
    it('should delegate decoding to static method', () => {
        const testMove: KamisadoMove = KamisadoMove.of(new Coord(0, 0), new Coord(1, 1));
        spyOn(KamisadoMove, "decode").and.callThrough();
        testMove.decode(testMove.encode());
        expect(KamisadoMove.decode).toHaveBeenCalledTimes(1);
    });
    it("should force move to start and end inside the board", () => {
        expect(() => KamisadoMove.of(new Coord(-1, 2), new Coord(2, 2))).toThrowError();
        expect(() => KamisadoMove.of(new Coord(0, 0), new Coord(-1, -1))).toThrowError();
        expect(() => KamisadoMove.of(new Coord(0, 0), new Coord(9, 9))).toThrowError();
        expect(() => KamisadoMove.of(new Coord(8, 5), new Coord(5, 5))).toThrowError();

    });
    it('should override correctly equality', () => {
        const move: KamisadoMove = KamisadoMove.of(new Coord(2, 2), new Coord(3, 3));
        const sameMove: KamisadoMove = KamisadoMove.of(new Coord(2, 2), new Coord(3, 3));
        const moveAsObject: Object = {
            start: new Coord(2, 2),
            end: new Coord(3, 3)
        };
        const neighboor: KamisadoMove = KamisadoMove.of(new Coord(3, 3), new Coord(2, 2));
        const stranger: KamisadoMove = KamisadoMove.of(new Coord(5, 5), new Coord(6, 5));
        expect(move.equals(move)).toBeTruthy("Move should equals himself");
        expect(move.equals(moveAsObject)).toBeFalsy("Instance should be checked");
        expect(move.equals(sameMove)).toBeTruthy("Move should be equals");
        expect(move.equals(neighboor)).toBeFalsy("Different move should be different");
        expect(move.equals(stranger)).toBeFalsy("Different move should be different");
    });
});
