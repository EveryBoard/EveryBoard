import { SiamRules, SiamNode } from "../siamrules/SiamRules";
import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { SiamMove } from "./SiamMove";
import { SiamPartSlice } from "../SiamPartSlice";
import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { Coord } from "src/app/jscaip/coord/Coord";
import { SiamPiece } from "../siampiece/SiamPiece";
import { MNode } from "src/app/jscaip/MNode";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

describe('SiamMove', () => {

    const _: number = SiamPiece.EMPTY.value;
    const M: number = SiamPiece.MOUNTAIN.value;

    const D: number = SiamPiece.WHITE_DOWN.value;

    it('SiamMove.encode and SiamMove.decode should be reversible', () => {
        const board: number[][] = [
            [_, _, D, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const move: SiamMove = new SiamMove(0, 0, MGPOptional.of(Orthogonale.DOWN), Orthogonale.UP);
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const node: SiamNode = new MNode(null, move, slice, 0);
        const rules: SiamRules = new SiamRules();
        const moves: MGPMap<SiamMove, SiamPartSlice> = rules.getListMoves(node);
        for (let i = 0; i < moves.size(); i++) {
            const move: SiamMove = moves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: SiamMove = SiamMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });

    it('should delegate decoding to static method', () => {
        const testMove: SiamMove = new SiamMove(-1, 0, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT);
        spyOn(SiamMove, "decode").and.callThrough();
        testMove.decode(testMove.encode());
        expect(SiamMove.decode).toHaveBeenCalledTimes(1);
    });

    it("Should force move to end inside the board", () => {
        expect(() => {
            new SiamMove(-1, 2, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        }).toThrowError("SiamMove should end or start on the board: SiamMove(-1, 2, UP, UP).");
    });

    it("Should forbid rotation outside the board", () => {
        expect(() => {
            new SiamMove(-1, 2, MGPOptional.empty(), Orthogonale.UP);
        }).toThrowError("Cannot rotate piece outside the board: SiamMove(-1, 2, -, UP).");
    });

    it("Should throw during invalid SiamMove creation", () => {
        expect(() => {
            new SiamMove(2, 2, MGPOptional.of(Orthogonale.UP), null);
        }).toThrowError("Landing orientation must be set.");
        expect(() => {
            new SiamMove(2, 2, null, Orthogonale.UP);
        }).toThrowError("Move Direction must be set (even if optional).");
        expect(() => {
            new SiamMove(0, 0, MGPOptional.of(Orthogonale.UP), Orthogonale.DOWN);
        }).toThrowError("SiamMove should have moveDirection and landingOrientation matching when a piece goes out of the board: SiamMove(0, 0, UP, DOWN).");
    });

    it('Should override correctly equality', () => {
        const moveA: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonale.UP), Orthogonale.RIGHT);
        const twin: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonale.UP), Orthogonale.RIGHT);
        const android: Object = {
            coord: new Coord(2, 2),
            movingDirection: Orthogonale.UP,
            landingOrientation: Orthogonale.RIGHT
        };
        const neighboor: SiamMove = new SiamMove(3, 3, MGPOptional.of(Orthogonale.UP), Orthogonale.RIGHT);
        const cousin: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonale.DOWN), Orthogonale.RIGHT);
        const stranger: SiamMove = new SiamMove(2, 2, MGPOptional.of(Orthogonale.UP), Orthogonale.LEFT);
        expect(moveA.equals(moveA)).toBeTruthy("Move should equals himself");
        expect(moveA.equals(android)).toBeFalsy("Instance should be checked");
        expect(moveA.equals(twin)).toBeTruthy("Move should be equals");
        expect(moveA.equals(neighboor)).toBeFalsy("Neighboor Move should be different");
        expect(moveA.equals(cousin)).toBeFalsy("Cousin Move should be different");
        expect(moveA.equals(stranger)).toBeFalsy("Stranger Move should be different");
    });
});