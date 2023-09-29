import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { PenteMove } from '../PenteMove';

describe('PenteMove', () => {
    describe('of', () => {
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
