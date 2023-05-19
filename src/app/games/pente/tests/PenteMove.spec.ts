import { Coord } from 'src/app/jscaip/Coord';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { PenteMove } from '../PenteMove';

fdescribe('PenteMove', () => {
    describe('from', () => {
        it('should not create move when it is not on the board', () => {
            RulesUtils.expectToThrowAndLog(() => PenteMove.of(new Coord(-1, 0)), 'PenteMove: coord is out of the board');
        });
        it('should create the move when it is on the board', () => {
            expect(() => PenteMove.of(new Coord(4, 2))).not.toThrow();
        });
    });
    describe('equals', () => {
        it('should return true for the same move', () => {
        });
        it('should return false for another move', () => {
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
        });
    });
});
