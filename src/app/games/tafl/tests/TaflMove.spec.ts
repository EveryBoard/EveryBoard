/* eslint-disable max-lines-per-function */
import { TaflMove } from '../TaflMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MyTaflMove } from './MyTaflMove.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { TaflFailure } from '../TaflFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';

describe('TaflMove', () => {

    it('TaflMove creation, as a MoveCoordToCoord, should throw when created static', () => {
        const error: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
        // TODO: c'est quelque chose qu'on veut pas, un from qui throw! Ce test teste du code de test mal implémenté, est-il réellement utile ?!
        expect(() => MyTaflMove.from(new Coord(0, 0), new Coord(0, 0)))
            .toThrowError(error);
    });

    describe('isValidStartAndEnd', () => {
        const outOfRange: Coord = new Coord(-1, -1);
        const inRange: Coord = new Coord(0, 0);
        it('should report when given out of range start coord', () => {
            const reason: string = 'Starting coord of TaflMove must be on the board, not at (-1, -1).';
            const validity: MGPValidation = TaflMove.isValidStartAndEnd(outOfRange, inRange, 7);
            expect(validity.isFailure()).toBeTrue();
            expect(validity.getReason()).toBe(reason);
        });
        it('should report when given out of range end coord', () => {
            const reason: string = 'Landing coord of TaflMove must be on the board, not at (-1, -1).';
            const validity: MGPValidation = TaflMove.isValidStartAndEnd(inRange, outOfRange, 7);
            expect(validity.isFailure()).toBeTrue();
            expect(validity.getReason()).toBe(reason);
        });
        it('should report diagonal moves', () => {
            const reason: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();
            const validity: MGPValidation = TaflMove.isValidStartAndEnd(new Coord(0, 0), new Coord(1, 1), 7);
            expect(validity.isFailure()).toBeTrue();
            expect(validity.getReason()).toBe(reason);
        });
        it('should report non-straight moves', () => {
            const reason: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();
            const validity: MGPValidation = TaflMove.isValidStartAndEnd(new Coord(0, 0), new Coord(2, 5), 7);
            expect(validity.isFailure()).toBeTrue();
            expect(validity.getReason()).toBe(reason);
        });
    });
    it('should override equals and toString correctly', () => {
        const a: Coord = new Coord(0, 0);
        const b: Coord = new Coord(0, 1);
        const c: Coord = new Coord(0, 2);
        const move: TaflMove = MyTaflMove.from(a, b).get();
        const neighbors: TaflMove = MyTaflMove.from(a, c).get();
        const cousin: TaflMove = MyTaflMove.from(c, b).get();
        const twin: TaflMove = MyTaflMove.from(a, b).get();
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighbors)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();

        expect(move.toString()).toEqual('TaflMove((0, 0)->(0, 1))');
    });
});
