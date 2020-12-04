import { EncapsuleRules } from "./EncapsuleRules";
import { EncapsuleMove } from "../encapsulemove/EncapsuleMove";
import { EncapsulePiece } from "../EncapsuleEnums";
import { Coord } from "src/app/jscaip/coord/Coord";
import { EncapsulePartSlice } from "../EncapsulePartSlice";

describe('EncapsuleRules', () => {

    let rules: EncapsuleRules;

    const drop: (piece: EncapsulePiece, coord: Coord) => boolean = (piece: EncapsulePiece, coord: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
        return rules.choose(move);
    }
    const move: (start: Coord, end: Coord) => boolean = (start: Coord, end: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromMove(start, end);
        return rules.choose(move);
    }
    beforeEach(() => {
        rules = new EncapsuleRules(EncapsulePartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('should allow simplest victory', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTruthy(0);
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(1, 0))).toBeTruthy(1);
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1))).toBeTruthy(2);
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(0, 1))).toBeTruthy(3);
        expect(drop(EncapsulePiece.MEDIUM_BLACK, new Coord(2, 2))).toBeTruthy(4);
        expect(rules.node.ownValue).toBe(Number.MIN_SAFE_INTEGER);
    });
    it('should refuse to put three identical piece on the board', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTruthy(0);
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(1, 0))).toBeTruthy(1);
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1))).toBeTruthy(2);
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(0, 1))).toBeTruthy(3);
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(2, 2))).toBeFalsy();
    });
    it('should refuse to move small piece on bigger piece', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTruthy(0);
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(1, 0))).toBeTruthy(1);
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalsy();
    });
    it('should refuse to move ennemy piece on the board', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTruthy(0);
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalsy();
    });
    it('should refuse to move or drop void', () => {
        expect(drop(EncapsulePiece.NONE, new Coord(0, 0))).toBeFalsy("drop");
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalsy("move");
    });
});