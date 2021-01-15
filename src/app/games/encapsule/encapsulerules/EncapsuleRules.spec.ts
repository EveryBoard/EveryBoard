import { EncapsuleRules } from './EncapsuleRules';
import { EncapsuleMove } from '../encapsulemove/EncapsuleMove';
import { EncapsulePiece } from '../EncapsuleEnums';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { EncapsulePartSlice } from '../EncapsulePartSlice';

describe('EncapsuleRules', () => {
    let rules: EncapsuleRules;

    const drop: (piece: EncapsulePiece, coord: Coord) => boolean = (piece: EncapsulePiece, coord: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
        return rules.choose(move);
    };
    const move: (start: Coord, end: Coord) => boolean = (start: Coord, end: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromMove(start, end);
        return rules.choose(move);
    };
    beforeEach(() => {
        rules = new EncapsuleRules(EncapsulePartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('should allow simplest victory for player zero', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_BLACK, new Coord(2, 2))).toBeTrue();
        expect(rules.node.ownValue).toBe(Number.MIN_SAFE_INTEGER);
    });
    it('should allow simplest victory for player zero', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(2, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_BLACK, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(2, 2))).toBeTrue();
        expect(rules.node.ownValue).toBe(Number.MAX_SAFE_INTEGER);
    });
    it('should refuse to put three identical piece on the board', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(2, 2))).toBeFalse();
    });
    it('should refuse to move small piece on bigger piece', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(1, 0))).toBeTrue();
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalse();
    });
    it('should refuse to move ennemy piece on the board', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTrue();
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalse();
    });
    it('should refuse to move or drop void', () => {
        expect(drop(EncapsulePiece.NONE, new Coord(0, 0))).toBeFalse();
        expect(move(new Coord(0, 0), new Coord(1, 0))).toBeFalse();
    });
});
