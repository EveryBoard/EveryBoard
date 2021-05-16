import { EncapsuleRules } from '../EncapsuleRules';
import { EncapsuleMinimax } from "../EncapsuleMinimax";
import { EncapsuleMove } from '../EncapsuleMove';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsuleCase, EncapsulePartSlice } from '../EncapsulePartSlice';
import { Player } from 'src/app/jscaip/Player';
import { EncapsulePiece } from '../EncapsulePiece';

describe('EncapsuleRules', () => {

    let rules: EncapsuleRules;

    let minimax: EncapsuleMinimax;

    const drop: (piece: EncapsulePiece, coord: Coord) => boolean = (piece: EncapsulePiece, coord: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
        return rules.choose(move);
    };
    const move: (start: Coord, end: Coord) => boolean = (start: Coord, end: Coord) => {
        const move: EncapsuleMove = EncapsuleMove.fromMove(start, end);
        return rules.choose(move);
    };
    const __: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE).encode();
    const B1: number = new EncapsuleCase(Player.ONE, Player.NONE, Player.NONE).encode();
    const B2: number = new EncapsuleCase(Player.NONE, Player.ONE, Player.NONE).encode();
    const B3: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.ONE).encode();
    const W1: number = new EncapsuleCase(Player.ZERO, Player.NONE, Player.NONE).encode();

    beforeEach(() => {
        rules = new EncapsuleRules(EncapsulePartSlice);
        minimax = new EncapsuleMinimax('EncapsuleMinimax');
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    describe('isVictory', () => {
        it('should detect victory', () => {
            const board: number[][] = [
                [B1, __, __],
                [__, B2, __],
                [__, __, B3],
            ];
            const slice: EncapsulePartSlice = new EncapsulePartSlice(board, 2, [
                EncapsulePiece.SMALL_WHITE, EncapsulePiece.SMALL_WHITE,
                EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
                EncapsulePiece.BIG_WHITE, EncapsulePiece.BIG_WHITE,
                EncapsulePiece.SMALL_BLACK, EncapsulePiece.MEDIUM_BLACK,
                EncapsulePiece.BIG_BLACK,
            ]);
            expect(EncapsuleRules.isVictory(slice)).toBeTrue();
        });
        it('should not consider a non-victory as a victory', () => {
            const board: number[][] = [
                [B1, __, __],
                [__, W1, __],
                [__, __, B3],
            ];
            const slice: EncapsulePartSlice = new EncapsulePartSlice(board, 2, [
                EncapsulePiece.SMALL_WHITE, EncapsulePiece.SMALL_WHITE,
                EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
                EncapsulePiece.BIG_WHITE, EncapsulePiece.BIG_WHITE,
                EncapsulePiece.SMALL_BLACK, EncapsulePiece.MEDIUM_BLACK,
                EncapsulePiece.BIG_BLACK,
            ]);
            expect(EncapsuleRules.isVictory(slice)).toBeFalse();
        });
    });
    it('should allow simplest victory for player zero', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_BLACK, new Coord(2, 2))).toBeTrue();
        expect(rules.node.getOwnValue(minimax).value).toBe(Number.MIN_SAFE_INTEGER);
    });
    it('should allow simplest victory for player zero', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(2, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(0, 0))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_BLACK, new Coord(1, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(1, 1))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 1))).toBeTrue();
        expect(drop(EncapsulePiece.MEDIUM_WHITE, new Coord(2, 2))).toBeTrue();
        expect(rules.node.getOwnValue(minimax).value).toBe(Number.MAX_SAFE_INTEGER);
    });
    it('should allow moving pieces on empty coord', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(2, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(2, 1))).toBeTrue();
        expect(move(new Coord(2, 0), new Coord(0, 0))).toBeTrue();
    });
    it('should allow moving piece on a smaller piece', () => {
        expect(drop(EncapsulePiece.MEDIUM_BLACK, new Coord(2, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(2, 1))).toBeTrue();
        expect(move(new Coord(2, 0), new Coord(2, 1))).toBeTrue();
    });
    it('should forbid moving pieces on a piece with the same size', () => {
        expect(drop(EncapsulePiece.SMALL_BLACK, new Coord(2, 0))).toBeTrue();
        expect(drop(EncapsulePiece.SMALL_WHITE, new Coord(2, 1))).toBeTrue();
        expect(move(new Coord(2, 0), new Coord(2, 1))).toBeFalse();
    });
    it('should forbid dropping a piece on a bigger piece', () => {
        const board: number[][] = [
            [B3, __, __],
            [__, __, __],
            [__, __, __],
        ];
        const slice: EncapsulePartSlice = new EncapsulePartSlice(board, 2, [
            EncapsulePiece.SMALL_WHITE, EncapsulePiece.SMALL_WHITE,
            EncapsulePiece.MEDIUM_WHITE, EncapsulePiece.MEDIUM_WHITE,
            EncapsulePiece.BIG_WHITE, EncapsulePiece.BIG_WHITE,
            EncapsulePiece.SMALL_BLACK, EncapsulePiece.MEDIUM_BLACK,
            EncapsulePiece.BIG_BLACK,
        ]);
        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
        expect(rules.isLegal(move, slice).legal.isFailure()).toBeTrue();
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
    describe('getListMoves', () => {
        it('should have 27 moves on first turn', () => {
            // 3 pieces x 9 coords = 27 moves
            expect(minimax.getListMoves(rules.node).length).toBe(27);
        });
        it('should have XX moves on a specific third turn', () => {
            drop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            drop(EncapsulePiece.SMALL_WHITE, new Coord(1, 0));
            // Drops medium = 9, drops big = 9, drops small = 7
            // Moving the piece on board = 7 possible landing cases
            // Total: 32
            expect(minimax.getListMoves(rules.node).length).toBe(32);
        });
    });
});
