import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { YinshCapture, YinshMove } from '../YinshMove';

describe('YinshCapture', () => {
    it('should not allow construction of captures other than with 5 coordinates', () => {
        const coords1: Coord[] = [new Coord(2, 3), new Coord(3, 3), new Coord(4, 3), new Coord(5, 3)];
        expect(() => new YinshCapture(coords1)).toThrow();
        const coords2: Coord[] = [
            new Coord(2, 3), new Coord(3, 3), new Coord(4, 3), new Coord(5, 3),
            new Coord(6, 3), new Coord(7, 3)];
        expect(() => new YinshCapture(coords2)).toThrow();
    });
    describe('of', () => {
        it('should return the capture with all coords from start to end', () => {
            const capture: YinshCapture = new YinshCapture([
                new Coord(2, 3), new Coord(3, 3),
                new Coord(4, 3), new Coord(5, 3), new Coord(6, 3)]);
            expect(YinshCapture.of(new Coord(2, 3), new Coord(6, 3)).equals(capture)).toBeTrue();
        });
    });
});

describe('YinshMove', () => {
    describe('encoder', () => {
        it('should define decode as the inverse of encode for initial placements', () => {
            const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
            EncoderTestUtils.expectToBeCorrect(YinshMove.encoder, move);
        });
        it('should define decode as the inverse of encode for move without capture', () => {
            const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.of(new Coord(5, 3)), []);
            EncoderTestUtils.expectToBeCorrect(YinshMove.encoder, move);
        });
        it('should define decode as the inverse of encode for move with captures', () => {
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(2, 3), new Coord(6, 3))],
                                                  new Coord(2, 3), MGPOptional.of(new Coord(5, 3)),
                                                  [YinshCapture.of(new Coord(3, 4), new Coord(7, 4))]);
            EncoderTestUtils.expectToBeCorrect(YinshMove.encoder, move);
        });
    });
    describe('isInitialPlacement', () => {
        it('should return true for initial placements only', () => {
            const move1: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
            expect(move1.isInitialPlacement()).toBeTrue();
            const move2: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.of(new Coord(5, 3)), []);
            expect(move2.isInitialPlacement()).toBeFalse();
        });
    });
    describe('equals', () => {
        const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
        const capture: YinshCapture = YinshCapture.of(new Coord(2, 3), new Coord(6, 3));
        it('should consider a move equal to itself', () => {
            expect(move.equals(move)).toBeTrue();
        });
        it('should consider the same move equal', () => {
            expect(move.equals(new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []))).toBeTrue();
        });
        it('should consider moves with different start to be different', () => {
            expect(move.equals(new YinshMove([], new Coord(3, 3), MGPOptional.empty(), []))).toBeFalse();
        });
        it('should consider move with different end to be different', () => {
            expect(move.equals(new YinshMove([], new Coord(3, 3), MGPOptional.of(new Coord(6, 3)), []))).toBeFalse();
        });
        it('should consider moves with different initial captures different', () => {
            const move2: YinshMove = new YinshMove([capture], new Coord(2, 3), MGPOptional.empty(), []);
            expect(move.equals(move2)).toBeFalse();
        });
        it('should consider moves with different initial captures different', () => {
            const move2: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), [capture]);
            expect(move.equals(move2)).toBeFalse();
        });
    });
    describe('toString', () => {
        it('should be defined for moves without captures', () => {
            const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
            expect(move.toString()).toBe('YinshMove([], (2, 3), MGPOptional.empty(), [])');
        });
        it('should be defined for moves with captures', () => {
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(2, 3), new Coord(6, 3))],
                                                  new Coord(2, 3), MGPOptional.of(new Coord(6, 3)),
                                                  []);
            expect(move.toString()).toBe('YinshMove([[(2, 3),(3, 3),(4, 3),(5, 3),(6, 3)]], (2, 3), MGPOptional.of((6, 3)), [])');
        });
    });
});

