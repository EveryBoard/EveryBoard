import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { EncapsuleRules } from '../EncapsuleRules';
import { EncapsulePartSlice } from '../EncapsulePartSlice';
import { Coord } from 'src/app/jscaip/Coord';
import { EncapsulePiece } from '../EncapsulePiece';
import { EncapsuleMove } from '../EncapsuleMove';

describe('EncapsuleMove', () => {
    it('should construct valid moves with success', () => {
        expect(EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(2, 1))).toBeTruthy();
        expect(EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 1))).toBeTruthy();
    });
    it('should throw when move has null as landing coord', () => {
        expect(() => EncapsuleMove.fromMove(new Coord(2, 1), null)).toThrow();
        expect(() => EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, null)).toThrow();
    });
    it('should throw when move has the same starting and landing coords', () => {
        expect(() => EncapsuleMove.fromMove(new Coord(2, 1), new Coord(2, 1))).toThrow();
    });
    describe('encode and decode', () => {
        it('should be reversible', () => {
            const rules: EncapsuleRules = new EncapsuleRules(EncapsulePartSlice);
            const firstTurnMoves: MGPMap<EncapsuleMove, EncapsulePartSlice> = rules.getListMoves(rules.node);
            for (let i: number = 0; i < firstTurnMoves.size(); i++) {
                const move: EncapsuleMove = firstTurnMoves.getByIndex(i).key;
                const encodedMove: number = move.encode();
                const decodedMove: EncapsuleMove = EncapsuleMove.decode(encodedMove);
                expect(decodedMove).toEqual(move);
            }
        });
    });
    describe('equals', () => {
        it('should consider same move equal', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            expect(moveA.equals(moveA)).toBeTrue();
            expect(moveA.equals(moveB)).toBeTrue();
        });
        it('should consider moves different due to different landing coord', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 1));
            expect(moveA.equals(moveB)).toBeFalse();
        });
        it('should consider moves different due to different starting coord', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 0), new Coord(2, 2));
            const moveB: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(2, 2));
            expect(moveA.equals(moveB)).toBeFalse();
        });
        it('should consider moves different due to different piece', () => {
            const moveA: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
            const moveB: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_BLACK, new Coord(0, 1));
            expect(moveA.equals(moveB)).toBeFalse();
        });
    });
    describe('toString', () => {
        it('should be defined', () => {
            expect(EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(2, 1)).toString()).toBeTruthy();
            expect(EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 1)).toString()).toBeTruthy();
        });
    });
    it('should delegate to static method decode', () => {
        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2));
        spyOn(EncapsuleMove, 'decode').and.callThrough();

        move.decode(move.encode());

        expect(EncapsuleMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate to non-static encode method', () => {
        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2));
        spyOn(move, 'encode').and.callThrough();

        EncapsuleMove.encode(move);

        expect(move.encode).toHaveBeenCalledTimes(1);
    });
    it('should have involutive encode and decode for move', () => {
        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2));
        expect(EncapsuleMove.decode(move.encode()).equals(move)).toBeTrue();
    });
    it('should have involutive encode and decode for drop', () => {
        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(2, 2));
        expect(EncapsuleMove.decode(move.encode()).equals(move)).toBeTrue();
    });
});
