/* eslint-disable max-lines-per-function */
import { TaflMove } from '../TaflMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MyTaflMove } from './MyTaflMove.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { TaflFailure } from '../TaflFailure';
import { MGPValidation, MGPValidationTestUtils, TestUtils } from '@everyboard/lib';

describe('TaflMove', () => {

    describe('creation', () => {
        const outOfRange: Coord = new Coord(-1, -1);
        const inRange: Coord = new Coord(0, 0);

        it('should throw with static moves', () => {
            const error: string = RulesFailure.MOVE_CANNOT_BE_STATIC();
            expect(() => MyTaflMove.from(new Coord(0, 0), new Coord(0, 0)))
                .toThrowError(error);
        });

        it('should throw with out of range start coord', () => {
            TestUtils.expectToThrowAndLog(() => MyTaflMove.from(outOfRange, inRange),
                                          'Starting coord of TaflMove must be on the board, not at (-1, -1).');
        });

        it('should throw with out of range end coord', () => {
            TestUtils.expectToThrowAndLog(() => MyTaflMove.from(inRange, outOfRange),
                                          'Landing coord of TaflMove must be on the board, not at (-1, -1).');
        });

    });

    describe('isValidDirection', () => {

        it('should report diagonal moves', () => {
            const validity: MGPValidation = TaflMove.isValidDirection(new Coord(0, 0), new Coord(1, 1));
            const reason: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();
            MGPValidationTestUtils.expectToBeFailure(validity, reason);
        });

        it('should report non-straight moves', () => {
            const validity: MGPValidation = TaflMove.isValidDirection(new Coord(0, 0), new Coord(2, 5));
            const reason: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();
            MGPValidationTestUtils.expectToBeFailure(validity, reason);
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
