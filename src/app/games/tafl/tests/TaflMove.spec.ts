/* eslint-disable max-lines-per-function */
import { TaflMove } from '../TaflMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MyTaflMove } from './MyTaflMove.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { TaflFailure } from '../TaflFailure';

describe('TaflMove', () => {

    it('TaflMove creation, as a MoveCoordToCoord, should throw when created static', () => {
        const error: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
        expect(() => MyTaflMove.of(new Coord(0, 0), new Coord(0, 0)))
            .toThrowError(error);
    });
    it('should throw when given out of range coords', () => {
        const outOfRange: Coord = new Coord(-1, -1);
        const inRange: Coord = new Coord(0, 0);
        expect(() => MyTaflMove.of(outOfRange, inRange))
            .toThrowError('Starting coord of TaflMove must be on the board, not at (-1, -1).');
        expect(() => MyTaflMove.of(inRange, outOfRange))
            .toThrowError('Landing coord of TaflMove must be on the board, not at (-1, -1).');
    });
    it('TaflMove must throw move instruction message when diagonal', () => {
        const error: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();
        expect(() => MyTaflMove.of(new Coord(0, 0), new Coord(1, 1))).toThrowError(error);
    });
    it('TaflMove must throw move instruction message when non linear', () => {
        const error: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();
        expect(() => MyTaflMove.of(new Coord(0, 0), new Coord(2, 5))).toThrowError(error);
    });
    it('should override equals and toString correctly', () => {
        const a: Coord = new Coord(0, 0);
        const b: Coord = new Coord(0, 1);
        const c: Coord = new Coord(0, 2);
        const move: TaflMove = MyTaflMove.of(a, b);
        const neighbors: TaflMove = MyTaflMove.of(a, c);
        const cousin: TaflMove = MyTaflMove.of(c, b);
        const twin: TaflMove = MyTaflMove.of(a, b);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighbors)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();

        expect(move.toString()).toEqual('TaflMove((0, 0)->(0, 1))');
    });
});
