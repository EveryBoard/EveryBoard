import { MGPMap } from "src/app/collectionlib/mgpmap/MGPMap";
import { PylosCoord } from "../pylos-coord/PylosCoord";
import { PylosPartSlice } from "../pylos-part-slice/PylosPartSlice";
import { PylosRules } from "../pylos-rules/PylosRules";
import { PylosMove } from "./PylosMove";

describe('PylosMove', () => {

    it('Should forbid move creation where landing coord isnt higher than starting coord', () => {
        expect(() => PylosMove.fromMove(new PylosCoord(0, 0, 0), new PylosCoord(0, 0, 0), [])).toThrowError("PylosMove: When piece move it must move upward.");
    });

    it('PylosMove.encode and PylosMove.decode should be reversible', () => {
        const rules: PylosRules = new PylosRules();
        const firstTurnMoves: MGPMap<PylosMove, PylosPartSlice> = rules.getListMoves(rules.node);
        expect(firstTurnMoves.size()).toEqual(16, "Should be 16 choices at first turn");
        for (let i = 0; i < firstTurnMoves.size(); i++) {
            const move: PylosMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: PylosMove = PylosMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });

    it('should delegate to static method decode', () => {

        const testMove: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        spyOn(PylosMove, "decode").and.callThrough();

        testMove.decode(testMove.encode());

        expect(PylosMove.decode).toHaveBeenCalledTimes(1);
    });
});