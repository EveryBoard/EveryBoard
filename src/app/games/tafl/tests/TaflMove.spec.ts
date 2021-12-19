import { TaflMove } from '../TaflMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MyTaflMove } from './MyTaflMove.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('TaflMove', () => {

    it('TaflMove creation, as a MoveCoordToCoord, should throw when created static', () => {
        const error: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
        expect(() => MyTaflMove.from(new Coord(0, 0), new Coord(0, 0)))
            .toThrowError(error);
    });
    it('Should throw when given out of range coords', () => {
        const outOfRange: Coord = new Coord(-1, -1);
        const inRange: Coord = new Coord(0, 0);
        expect(() => MyTaflMove.from(outOfRange, inRange))
            .toThrowError('Starting coord of TaflMove must be on the board, not at (-1, -1).');
        expect(() => MyTaflMove.from(inRange, outOfRange))
            .toThrowError('Landing coord of TaflMove must be on the board, not at (-1, -1).');
    });
    it('TaflMove must throw if created non-orthogonally', () => {
        expect(() => MyTaflMove.from(new Coord(0, 0), new Coord(1, 1))).toThrowError('TaflMove cannot be diagonal.');
    });
    it('Should override equals and toString correctly', () => {
        const a: Coord = new Coord(0, 0);
        const b: Coord = new Coord(0, 1);
        const c: Coord = new Coord(0, 2);
        const move: TaflMove = MyTaflMove.from(a, b);
        const neighbors: TaflMove = MyTaflMove.from(a, c);
        const cousin: TaflMove = MyTaflMove.from(c, b);
        const twin: TaflMove = MyTaflMove.from(a, b);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighbors)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();

        expect(move.toString()).toEqual('TaflMove((0, 0)->(0, 1))');
    });
});
