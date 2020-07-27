import { EncapsuleRules } from "./EncapsuleRules";
import { EncapsuleMove } from "../encapsulemove/EncapsuleMove";
import { EncapsulePiece } from "../EncapsuleEnums";
import { Coord } from "src/app/jscaip/Coord";

fdescribe('EncapsuleRules', () => {

    let rules: EncapsuleRules;

    beforeEach(() => {
        rules = new EncapsuleRules();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('should allow simple move', () => {
        const drop: (piece: EncapsulePiece, coord: Coord) => boolean = (piece: EncapsulePiece, coord: Coord) => {
            const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
            return rules.choose(move);
        }
        const move: (start: Coord, end: Coord) => boolean = (start: Coord, end: Coord) => {
            const move: EncapsuleMove = EncapsuleMove.fromMove(start, end);
            return rules.choose(move);
        }
        expect(drop(EncapsulePiece.MEDIUM_BLACK, new Coord(0, 0))).toBeTruthy(0);
        expect(drop(EncapsulePiece.BIG_WHITE, new Coord(0, 0))).toBeTruthy(1);
        expect(drop(EncapsulePiece.BIG_BLACK, new Coord(1, 1))).toBeTruthy(2);
        expect(drop(EncapsulePiece.BIG_WHITE, new Coord(0, 1))).toBeTruthy(3);
        expect(drop(EncapsulePiece.BIG_BLACK, new Coord(2, 2))).toBeTruthy(4);
        expect(drop(EncapsulePiece.BIG_WHITE, new Coord(0, 2))).toBeTruthy(5);
        expect(rules.node.ownValue).toBe(Number.MAX_SAFE_INTEGER);
    });
});