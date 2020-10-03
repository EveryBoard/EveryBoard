import { KamisadoRules } from "../kamisadorules/KamisadoRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { KamisadoMove } from "./KamisadoMove";
import { KamisadoPartSlice } from "../KamisadoPartSlice";
import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { Coord } from "src/app/jscaip/coord/Coord";
import { MNode } from "src/app/jscaip/MNode";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { KamisadoPiece } from "../KamisadoPiece";
import { KamisadoBoard } from "../KamisadoBoard";

describe('SiamMove', () => {

    const _: number = KamisadoPiece.NONE.getValue();

    const initialBoard: number[][] = ArrayUtils.mapBiArray(KamisadoBoard.getInitialBoard(), p => p.getValue());

    it('KamisadoMove.encode and KamisadoMove.decode should be reversible', () => {
        for (let y1 = 0; y1 < KamisadoBoard.SIZE; y1++) {
            for (let x1 = 0; x1 < KamisadoBoard.SIZE; x1++) {
                const startCoord: Coord = new Coord(x1, y1);
                for (let y2 = 0; y2 < KamisadoBoard.SIZE; y2++) {
                    for (let x2 = 0; x2 < KamisadoBoard.SIZE; x2++) {
                        if (x2 != x1 || y2 != y1) {
                            const endCoord: Coord = new Coord(x2, y2);
                            const move: KamisadoMove = new KamisadoMove(startCoord, endCoord);
                            const encodedMove: number = move.encode();
                            const decodedMove: KamisadoMove = KamisadoMove.decode(encodedMove);
                            expect(decodedMove).toEqual(move);
                        }
                    }
                }       
            }
        }
    });
    it('should delegate decoding to static method', () => {
        const testMove: KamisadoMove = new KamisadoMove(new Coord(0, 0), new Coord(1, 1));
        spyOn(KamisadoMove, "decode").and.callThrough();
        testMove.decode(testMove.encode());
        expect(KamisadoMove.decode).toHaveBeenCalledTimes(1);
    });
    it("Should force move to start and end inside the board", () => {
        expect(() => new KamisadoMove(new Coord(-1, 2), new Coord(2, 2))).toThrowError();
        expect(() => new KamisadoMove(new Coord(0, 0), new Coord(-1, -1))).toThrowError();
        expect(() => new KamisadoMove(new Coord(0, 0), new Coord(9, 9))).toThrowError();
        expect(() => new KamisadoMove(new Coord(8, 5), new Coord(5, 5))).toThrowError();
        
    });
    it('Should override correctly equality', () => {
        const move: KamisadoMove = new KamisadoMove(new Coord(2, 2), new Coord(3, 3));
        const sameMove: KamisadoMove = new KamisadoMove(new Coord(2, 2), new Coord(3, 3));
        const moveAsObject: Object = {
            start: new Coord(2, 2),
            end: new Coord(3, 3)
        };
        const neighboor: KamisadoMove = new KamisadoMove(new Coord(3, 3), new Coord(2, 2));
        const stranger: KamisadoMove = new KamisadoMove(new Coord(5, 5), new Coord(6, 5));
        expect(move.equals(move)).toBeTruthy("Move should equals himself");
        expect(move.equals(moveAsObject)).toBeFalsy("Instance should be checked");
        expect(move.equals(sameMove)).toBeTruthy("Move should be equals");
        expect(move.equals(neighboor)).toBeFalsy("Different move should be different");
        expect(move.equals(stranger)).toBeFalsy("Different move should be different");
    });
});