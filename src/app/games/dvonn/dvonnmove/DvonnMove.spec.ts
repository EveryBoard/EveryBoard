import { DvonnMove } from "./DvonnMove";
import { Coord } from "src/app/jscaip/coord/Coord";

describe('DvonnMove', () => {
    it('should toString in a readable way', () => {
        expect((DvonnMove.of(new Coord(3, 2), new Coord(3, 3))).toString()).toEqual("DvonnMove((3, 2)->(3, 3))");
        expect(DvonnMove.PASS.toString()).toEqual("DvonnMove(PASS)");
    });
    it('should correctly encode and decode coord to coord moves', () => {
        const move1: DvonnMove = DvonnMove.of(new Coord(3, 2), new Coord(3, 3));
        const encoded1: number = move1.encode();
        const decoded1: DvonnMove = DvonnMove.decode(encoded1);
        expect(decoded1).toEqual(move1);
        const decoded2: DvonnMove = move1.decode(encoded1);
        expect(decoded2).toEqual(move1);
    });
    it('should correctly encode and decode PASS', () => {
        const encodedMove: number = DvonnMove.PASS.encode();
        const decodedMove: DvonnMove = DvonnMove.decode(encodedMove);
        expect(decodedMove).toEqual(DvonnMove.PASS);
    });
    it('should force move to start and end inside the board', () => {
        expect(() => DvonnMove.of(new Coord(-1, 2), new Coord(0, 2))).toThrowError();
        expect(() => DvonnMove.of(new Coord(0, 2), new Coord(-1, 2))).toThrowError();
        expect(() => DvonnMove.of(new Coord(10, 2), new Coord(11, 2))).toThrowError();
        expect(() => DvonnMove.of(new Coord(10, 5), new Coord(10, 3))).toThrowError();
    });
    it('should force moves to be in a straight line', () => {
        expect(DvonnMove.of(new Coord(2, 0), new Coord(4, 0))).toBeTruthy();
        expect(DvonnMove.of(new Coord(2, 0), new Coord(2, 3))).toBeTruthy();
        expect(DvonnMove.of(new Coord(2, 0), new Coord(1, 1))).toBeTruthy();
        expect(DvonnMove.of(new Coord(5, 2), new Coord(4, 2))).toBeTruthy();
        expect(DvonnMove.of(new Coord(5, 2), new Coord(5, 1))).toBeTruthy();
        expect(DvonnMove.of(new Coord(5, 2), new Coord(6, 1))).toBeTruthy();
        expect(() => DvonnMove.of(new Coord(2, 0), new Coord(3, 2))).toThrowError();
    });
    it('should correctly compute move lengths', () => {
        expect(DvonnMove.of(new Coord(2, 0), new Coord(4, 0)).length()).toEqual(2)
        expect(DvonnMove.of(new Coord(2, 0), new Coord(2, 3)).length()).toEqual(3);
        expect(DvonnMove.of(new Coord(2, 0), new Coord(1, 1)).length()).toEqual(1);
        expect(DvonnMove.of(new Coord(5, 2), new Coord(3, 2)).length()).toEqual(2);
        expect(DvonnMove.of(new Coord(5, 2), new Coord(5, 0)).length()).toEqual(2);
        expect(DvonnMove.of(new Coord(5, 2), new Coord(6, 1)).length()).toEqual(1);
    })
    it('should override equality', () => {
        const move: DvonnMove = DvonnMove.of(new Coord(2, 2), new Coord(2, 3));
        const sameMove: DvonnMove = DvonnMove.of(new Coord(2, 2), new Coord(2, 3));
        const moveAsObject: Object = {
            start: new Coord(2, 2),
            end: new Coord(2, 3)
        };
        const neighboor: DvonnMove = DvonnMove.of(new Coord(3, 3), new Coord(2, 3));
        const stranger: DvonnMove = DvonnMove.of(new Coord(5, 2), new Coord(6, 2));
        expect(move.equals(move)).toBeTruthy("Move should equals himself");
        expect(move.equals(moveAsObject)).toBeFalsy("Instance should be checked");
        expect(move.equals(sameMove)).toBeTruthy("Move should be equals");
        expect(move.equals(neighboor)).toBeFalsy("Different move should be different");
        expect(move.equals(stranger)).toBeFalsy("Different move should be different");
    });
});
