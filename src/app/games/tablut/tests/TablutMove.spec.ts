import { TablutRules } from '../TablutRules';
import { TablutMove } from '../TablutMove';
import { MGPMap } from 'src/app/utils/MGPMap';
import { TablutPartSlice } from '../TablutPartSlice';
import { Coord } from 'src/app/jscaip/Coord';

describe('TablutMove', () => {

    it('TablutMove.encode and TablutMove.decode should be reversible', () => {
        const rules: TablutRules = new TablutRules(TablutPartSlice);
        const firstTurnMoves: MGPMap<TablutMove, TablutPartSlice> = rules.getListMoves(rules.node);
        for (let i: number = 0; i < firstTurnMoves.size(); i++) {
            const move: TablutMove = firstTurnMoves.getByIndex(i).key;
            const encodedMove: number = move.encode();
            const decodedMove: TablutMove = TablutMove.decode(encodedMove);
            expect(decodedMove).toEqual(move);
        }
    });
    it('TablutMove creation, as a MoveCoordToCoord, should throw when created immobile', () => {
        expect(() => new TablutMove(new Coord(0, 0), new Coord(0, 0)))
            .toThrowError('MoveCoordToCoord cannot be static.');
    });
    it('Should throw when given out of range coords', () => {
        const outOfRange: Coord = new Coord(-1, -1);
        const inRange: Coord = new Coord(0, 0);
        expect(() => new TablutMove(outOfRange, inRange))
            .toThrowError('Starting coord of TablutMove must be on the board, not at (-1, -1).');
        expect(() => new TablutMove(inRange, outOfRange))
            .toThrowError('Landing coord of TablutMove must be on the board, not at (-1, -1).');
    });
    it('TablutMove must throw if created non-orthogonally', () => {
        expect(() => new TablutMove(new Coord(0, 0), new Coord(1, 1))).toThrowError('TablutMove cannot be diagonal.');
    });
    it('should delegate decoding to static method', () => {
        const testMove: TablutMove = new TablutMove(new Coord(1, 1), new Coord(2, 1));
        spyOn(TablutMove, 'decode').and.callThrough();
        testMove.decode(testMove.encode());
        expect(TablutMove.decode).toHaveBeenCalledTimes(1);
    });
    it('Should override equals and toString correctly', () => {
        const a: Coord = new Coord(0, 0);
        const b: Coord = new Coord(0, 1);
        const c: Coord = new Coord(0, 2);
        const move: TablutMove = new TablutMove(a, b);
        const neighboors: TablutMove = new TablutMove(a, c);
        const cousin: TablutMove = new TablutMove(c, b);
        const twin: TablutMove = new TablutMove(a, b);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighboors)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();

        expect(move.toString()).toEqual('TablutMove((0, 0)->(0, 1))');
    });
});
