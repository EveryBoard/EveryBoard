/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { EncoderTestUtils, MGPOptional } from '@everyboard/lib';
import { YinshCapture, YinshMove } from '../YinshMove';

describe('YinshCapture', () => {

    it('should not allow construction of captures other than with 5 coordinates', () => {
        const coords1: Coord[] = [new Coord(2, 3), new Coord(3, 3), new Coord(4, 3), new Coord(5, 3)];
        const ringTaken: Coord = new Coord(4, 4);
        expect(() => new YinshCapture(coords1, MGPOptional.of(ringTaken))).toThrowError('YinshCapture must capture exactly 5 pieces');
        const coords2: Coord[] = [
            new Coord(2, 3), new Coord(3, 3), new Coord(4, 3), new Coord(5, 3),
            new Coord(6, 3), new Coord(7, 3)];
        expect(() => new YinshCapture(coords2, MGPOptional.of(ringTaken))).toThrowError('YinshCapture must capture exactly 5 pieces');
    });

    describe('of', () => {

        it('should return the capture with all coords from start to end', () => {
            const markers: Coord[] = [
                new Coord(2, 3),
                new Coord(3, 3),
                new Coord(4, 3),
                new Coord(5, 3),
                new Coord(6, 3),
            ];
            const capture: YinshCapture = new YinshCapture(markers, MGPOptional.of(new Coord(4, 4)));
            const expectedCapture: YinshCapture =
                YinshCapture.of(new Coord(2, 3), new Coord(6, 3), MGPOptional.of(new Coord(4, 4)));
            expect(expectedCapture.equals(capture)).toBeTrue();
        });

    });

    describe('equals', () => {

        it('should consider captures with different ring takens not equal', () => {
            const capture1: YinshCapture =
                YinshCapture.of(new Coord(2, 3), new Coord(6, 3), MGPOptional.of(new Coord(4, 4)));
            const capture2: YinshCapture =
                YinshCapture.of(new Coord(2, 3), new Coord(6, 3), MGPOptional.of(new Coord(5, 4)));
            expect(capture1.equals(capture2)).toBeFalse();
        });

    });

});

describe('YinshMove', () => {

    describe('encoder', () => {

        it('should have a bijective encoder initial placements', () => {
            const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
            EncoderTestUtils.expectToBeBijective(YinshMove.encoder, move);
        });

        it('should have a bijective encoder for move without capture', () => {
            const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.of(new Coord(5, 3)), []);
            EncoderTestUtils.expectToBeBijective(YinshMove.encoder, move);
        });

        it('should have a bijective encoder for move with captures', () => {
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(2, 3),
                                                                   new Coord(6, 3),
                                                                   MGPOptional.of(new Coord(4, 5)))],
                                                  new Coord(2, 3),
                                                  MGPOptional.of(new Coord(5, 3)),
                                                  [YinshCapture.of(new Coord(3, 4),
                                                                   new Coord(7, 4),
                                                                   MGPOptional.of(new Coord(5, 5)))]);
            EncoderTestUtils.expectToBeBijective(YinshMove.encoder, move);
        });

    });

    describe('isInitialPlacement', () => {

        it('should return true for initial placements only', () => {
            const moveWithInitialPlacement: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
            expect(moveWithInitialPlacement.isInitialPlacement()).toBeTrue();
            const moveWithoutInitialPlacement: YinshMove =
                new YinshMove([], new Coord(2, 3), MGPOptional.of(new Coord(5, 3)), []);
            expect(moveWithoutInitialPlacement.isInitialPlacement()).toBeFalse();
        });

    });

    describe('equals', () => {
        const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
        const capture: YinshCapture =
            YinshCapture.of(new Coord(2, 3), new Coord(6, 3), MGPOptional.of(new Coord(4, 4)));

        it('should consider a move equal to itself', () => {
            expect(move.equals(move)).toBeTrue();
        });

        it('should consider the same move equal', () => {
            const sameMove: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
            expect(move.equals(sameMove)).toBeTrue();
        });

        it('should consider moves with different start to be different', () => {
            const differentMove: YinshMove = new YinshMove([], new Coord(3, 3), MGPOptional.empty(), []);
            expect(move.equals(differentMove)).toBeFalse();
        });

        it('should consider move with different end to be different', () => {
            const differentMove: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.of(new Coord(6, 3)), []);
            expect(move.equals(differentMove)).toBeFalse();
        });

        it('should consider moves with different initial captures different', () => {
            const differentMove: YinshMove = new YinshMove([capture], new Coord(2, 3), MGPOptional.empty(), []);
            expect(move.equals(differentMove)).toBeFalse();
        });

        it('should consider moves with different final captures different', () => {
            const differentMove: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), [capture]);
            expect(move.equals(differentMove)).toBeFalse();
        });

    });

    describe('toString', () => {

        it('should be defined for moves without captures', () => {
            const move: YinshMove = new YinshMove([], new Coord(2, 3), MGPOptional.empty(), []);
            expect(move.toString()).toBe('YinshMove([], (2, 3), MGPOptional.empty(), [])');
        });

        it('should be defined for moves with captures', () => {
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(2, 3),
                                                                   new Coord(6, 3),
                                                                   MGPOptional.of(new Coord(4, 3)))],
                                                  new Coord(2, 3),
                                                  MGPOptional.of(new Coord(6, 3)),
                                                  []);
            expect(move.toString()).toBe('YinshMove([[(2, 3),(3, 3),(4, 3),(5, 3),(6, 3)]], (2, 3), MGPOptional.of((6, 3)), [])');
        });

    });

});
