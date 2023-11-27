import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from '@everyboard/lib';
import { PenteMove } from '../PenteMove';
import { TestUtils } from 'src/app/utils/tests/TestUtils.spec';

describe('PenteMove', () => {
    describe('of', () => {
        it('should not create move when it is not on the board', () => {
            TestUtils.expectToThrowAndLog(() => PenteMove.of(new Coord(-1, 0)), 'PenteMove: coord is out of the board');
        });
        it('should create the move when it is on the board', () => {
            expect(() => PenteMove.of(new Coord(4, 2))).not.toThrow();
        });
    });
    describe('toString', () => {
        it('should be defined', () => {
            const move: PenteMove = PenteMove.of(new Coord(2, 3));
            expect(move.toString()).toBe('PenteMove(2, 3)');
        });
    });
    describe('equals', () => {
        it('should return true for the same move', () => {
            const move: PenteMove = PenteMove.of(new Coord(2, 3));
            expect(move.equals(move)).toBeTrue();
        });
        it('should return false for another move', () => {
            const move: PenteMove = PenteMove.of(new Coord(2, 3));
            const otherMove: PenteMove = PenteMove.of(new Coord(4, 2));
            expect(move.equals(otherMove)).toBeFalse();
        });
    });
    describe('encoder', () => {
        it('should be bijective', () => {
            EncoderTestUtils.expectToBeBijective(PenteMove.encoder, PenteMove.of(new Coord(2, 3)));
        });
    });
});
