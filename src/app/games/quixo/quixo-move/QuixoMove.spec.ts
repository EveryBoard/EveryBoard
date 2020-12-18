import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { Coord } from "src/app/jscaip/coord/Coord";
import { Orthogonal } from "src/app/jscaip/DIRECTION";
import { MGPNode } from "src/app/jscaip/mgpnode/MGPNode";
import { Player } from "src/app/jscaip/Player";
import { QuixoPartSlice } from "../quixo-part-slice/QuixoPartSlice";
import { QuixoNode, QuixoRules } from "../quixo-rules/QuixoRules";
import { QuixoMove } from "../QuixoMove";

describe('QuixoMove:', () => {

    let _: number = Player.NONE.value;
    let X: number = Player.ONE.value;
    let O: number = Player.ZERO.value;

    it("Should forbid move creation for invalid x or y coord", () => {
        expect(() => new QuixoMove(-1, 0, Orthogonal.UP)).toThrowError("Invalid coord for QuixoMove: (-1, 0) is outside the board.");
    });

    it("Should forbid move creation from coord not on the side", () => {
        expect(() => new QuixoMove(1, 1, Orthogonal.UP)).toThrowError("Invalid coord for QuixoMove: (1, 1) is not on the edge.");
    });

    it("Should forbid move creation without direction", () => {
        expect(() => new QuixoMove(0, 0, null)).toThrowError("Direction cannot be null.");
    });

    it("Should forbid move creation from board who'se side is the same as the direction", () => {
        expect(() => new QuixoMove(0, 2, Orthogonal.LEFT)).toThrowError("Invalid direction: pawn on the left side can't be moved to the left (0, 2).");
        expect(() => new QuixoMove(4, 2, Orthogonal.RIGHT)).toThrowError("Invalid direction: pawn on the right side can't be moved to the right (4, 2).");
        expect(() => new QuixoMove(2, 0, Orthogonal.UP)).toThrowError("Invalid direction: pawn on the top side can't be moved up (2, 0).");
        expect(() => new QuixoMove(2, 4, Orthogonal.DOWN)).toThrowError("Invalid direction: pawn on the bottom side can't be moved down (2, 4).");
    });

    it('QuixoMove.encode and QuixoMove.decode should be reversible', () => {
        const board: number[][] = [
            [_, X, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [X, _, _, _, _],
            [_, _, _, X, _]
        ];
        const move: QuixoMove = new QuixoMove(0, 0, Orthogonal.DOWN);
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const node: QuixoNode = new MGPNode(null, move, slice, 0);
        const rules: QuixoRules = new QuixoRules(QuixoPartSlice);
        const moves: MGPMap<QuixoMove, QuixoPartSlice> = rules.getListMoves(node);
        for (let i = 0; i < moves.size(); i++) {
            const move: QuixoMove = moves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: QuixoMove = QuixoMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });

    it('should delegate decoding to static method', () => {
        const testMove: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);
        spyOn(QuixoMove, "decode").and.callThrough();
        testMove.decode(testMove.encode());
        expect(QuixoMove.decode).toHaveBeenCalledTimes(1);
    });

    it('Should override correctly equals and toString', () => {
        const move: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);
        const android: Object = {
            coord: new Coord(0, 0),
            direction: Orthogonal.RIGHT
        };
        const neighboor: QuixoMove = new QuixoMove(0, 1, Orthogonal.RIGHT);
        const twin: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);
        const cousin: QuixoMove = new QuixoMove(0, 0, Orthogonal.DOWN);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(android)).toBeFalse();
        expect(move.equals(neighboor)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();
        expect(move.toString()).toBe("QuixoMove(0, 0, RIGHT)");
    });
});
