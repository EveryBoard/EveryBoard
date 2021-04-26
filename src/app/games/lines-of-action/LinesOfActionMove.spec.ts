import { Coord } from 'src/app/jscaip/coord/Coord';
import { NumberEncoderTestUtils } from 'src/app/jscaip/Encoder.spec';
import { LinesOfActionMove } from './LinesOfActionMove';

describe('LinesOfActionMove', () => {
    const move: LinesOfActionMove = new LinesOfActionMove(new Coord(5, 3), new Coord(3, 5));

    describe('encoder', () => {
        it('should correctly encode and decode', () => {
            NumberEncoderTestUtils.expectToBeCorrect(LinesOfActionMove.encoder, move);
        });
    });
    it('should fail when creating a move outside of the board', () => {
        expect(() => new LinesOfActionMove(new Coord(-1, 5), new Coord(3, 5))).toThrow();
        expect(() => new LinesOfActionMove(new Coord(3, 5), new Coord(10, 3))).toThrow();
    });
    it('should fail when creating a move with no direction', () => {
        expect(() => new LinesOfActionMove(new Coord(3, 3), new Coord(4, 5))).toThrow();
    });
    describe('toString', () => {
        it('should be defined', () => {
            expect(move.toString()).toEqual('LinesOfActionMove((5, 3), (3, 5))');
        });
    });
    describe('equal', () => {
        it('should consider a move equal to itself', () => {
            expect(move.equals(move)).toBeTrue();
        });
        it('should not consider equal moves with different starting coordinate', () => {
            const move2: LinesOfActionMove = new LinesOfActionMove(new Coord(4, 3), new Coord(3, 5));
            expect(move.equals(move2)).toBeFalse();
        });
        it('should not consider equal moves with different end coordinate', () => {
            const move2: LinesOfActionMove = new LinesOfActionMove(new Coord(5, 3), new Coord(4, 5));
            expect(move.equals(move2)).toBeFalse();
        });
    });
});
