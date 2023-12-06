/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLine } from 'src/app/jscaip/HexaLine';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GipfMove, GipfPlacement } from '../GipfMove';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { GipfCapture } from 'src/app/jscaip/GipfProjectHelper';

describe('GipfCapture', () => {

    it('should forbid construction of captures smaller than 4', () => {
        const coords: Coord[] = [new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1)];
        expect(() => new GipfCapture(coords)).toThrow();
    });

    it('should forbid construction of captures with duplicate spaces', () => {
        const coords: Coord[] = [new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(1, -3)];
        expect(() => new GipfCapture(coords)).toThrow();
    });

    it('should forbid construction with pieces not on the same line', () => {
        const coords: Coord[] = [new Coord(0, 0), new Coord(0, 1), new Coord(0, 2), new Coord(2, 2)];
        expect(() => new GipfCapture(coords)).toThrow();
    });

    it('should forbid construction of lines with hole', () => {
        const coords: Coord[] = [new Coord(0, 0), new Coord(0, 1), new Coord(0, 2), new Coord(0, 4)];
        expect(() => new GipfCapture(coords)).toThrow();
    });

    it('should allow construction of valid capture', () => {
        const coords: Coord[] = [
            new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0), new Coord(2, 0), new Coord(3, 0),
        ];
        expect(() => new GipfCapture(coords)).not.toThrow();
    });

    describe('toString', () => {

        it('should contain all captured spaces', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            expect(capture.toString()).toBe('(-2, 0),(-1, -1),(0, -2),(1, -3)');
        });

    });

    describe('encoder', () => {

        it('should have a bijective encoder', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            EncoderTestUtils.expectToBeBijective(GipfCapture.encoder, capture);
        });

    });

    describe('size', () => {

        it('should return the size of the capture', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            expect(capture.size()).toEqual(4);
        });

    });

    describe('forEach', () => {

        it('should iterate over all elements of the capture', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            let count: number = 0;
            capture.forEach((c: Coord) => {
                count += 1;
            });
            expect(count).toEqual(4);
        });

    });

    describe('contains', () => {

        it('should detect when a coordinate is contained in the capture', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            expect(capture.contains(new Coord(0, -2))).toBeTrue();
        });

        it('should detect when a coordinate is not contained in the capture', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            expect(capture.contains(new Coord(-3, 1))).toBeFalse();
        });

    });

    describe('intersects', () => {

        it('should detect when captures intersect', () => {
            const capture1: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            const capture2: GipfCapture = new GipfCapture([
                new Coord(0, -3), new Coord(1, -3), new Coord(2, -3), new Coord(3, -3),
            ]);
            expect(capture1.intersectsWith(capture2)).toBeTrue();
        });

        it('should detect when captures do not intersect', () => {
            const capture1: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            const capture2: GipfCapture = new GipfCapture([
                new Coord(3, -3), new Coord(3, -2), new Coord(3, -1), new Coord(3, 0),
            ]);
            expect(capture1.intersectsWith(capture2)).toBeFalse();
        });

    });

    describe('getLine', () => {

        it('should return the line of the capture', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(4, 0), new Coord(3, 1), new Coord(2, 2), new Coord(1, 3),
            ]);
            const line: HexaLine = HexaLine.constantS(4);
            expect(capture.getLine().equals(line)).toBeTrue();
        });

    });

});

describe('GipfPlacement', () => {

    describe('toString', () => {

        it('should work on placements without direction', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.empty());
            expect(placement.toString()).toBe('(-3, 0)');
        });

        it('should work on placements with direction', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.of(HexaDirection.DOWN));
            expect(placement.toString()).toBe('(-3, 0)@DOWN');
        });

    });

    describe('encoder', () => {

        it('should correctly encode and decode placements with a direction', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.of(HexaDirection.DOWN));
            EncoderTestUtils.expectToBeBijective(GipfPlacement.encoder, placement);
        });

        it('should correctly encode and decode placements without a direction', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.empty());
            EncoderTestUtils.expectToBeBijective(GipfPlacement.encoder, placement);
        });

    });

    describe('equals', () => {

        it('should detect equal placements', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.of(HexaDirection.DOWN));
            expect(placement.equals(placement)).toBeTrue();
        });

        it('should detect different placements', () => {
            const placement1: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.of(HexaDirection.DOWN));
            const placement2: GipfPlacement = new GipfPlacement(new Coord(1, -3), MGPOptional.of(HexaDirection.DOWN));
            const placement3: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                                MGPOptional.of(HexaDirection.RIGHT));
            expect(placement1.equals(placement2)).toBeFalse();
            expect(placement1.equals(placement3)).toBeFalse();
        });

    });

});

describe('GipfMove', () => {

    describe('toString', () => {

        it('should work on a move without capture', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN));
            const move: GipfMove = new GipfMove(placement, [], []);
            expect(move.toString()).toBe('GipfMove([], (-3, 0)@DOWN, [])');
        });

        it('should work on a move with captures', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN));
            const capture1: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            const capture2: GipfCapture = new GipfCapture([
                new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1),
            ]);
            const move: GipfMove = new GipfMove(placement, [capture1, capture2], []);
            expect(move.toString()).toBe('GipfMove([[(-2, 0),(-1, -1),(0, -2),(1, -3)],[(0, -3),(0, -2),(0, -1),(0, 0),(0, 1)]], (-3, 0)@DOWN, [])');
        });

    });

    it('should have bijective encoder', () => {
        const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                           MGPOptional.of(HexaDirection.DOWN));
        const placement0: GipfPlacement = new GipfPlacement(new Coord(1, -3),
                                                            MGPOptional.of(HexaDirection.DOWN_LEFT));
        const initialCapture: GipfCapture = new GipfCapture([
            new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
        ]);
        const finalCapture: GipfCapture = new GipfCapture([
            new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1),
        ]);
        const placement1: GipfPlacement = new GipfPlacement(new Coord(1, -3), MGPOptional.of(HexaDirection.DOWN_LEFT));
        const capture1: GipfCapture = new GipfCapture([
            new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
        ]);
        const capture2: GipfCapture = new GipfCapture([
            new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1),
        ]);
        const moves: GipfMove[] = [
            new GipfMove(placement, [], []),
            new GipfMove(placement0, [initialCapture], [finalCapture]),
            new GipfMove(placement1, [capture1, capture2], []),
        ];
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(GipfMove.encoder, move);
        }
    });

    describe('equals', () => {
        const placement: GipfPlacement = new GipfPlacement(new Coord(1, -3),
                                                           MGPOptional.of(HexaDirection.DOWN_LEFT));
        const initialCapture: GipfCapture = new GipfCapture([
            new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
        ]);
        const finalCapture: GipfCapture = new GipfCapture([
            new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1),
        ]);
        const move: GipfMove = new GipfMove(placement, [initialCapture], [finalCapture]);

        it('should consider move equal to itself', () => {
            expect(move.equals(move)).toBeTrue();
        });

        it('should consider same move equal', () => {
            expect(move.equals(new GipfMove(placement, [initialCapture], [finalCapture]))).toBeTrue();
        });

        it('should consider different moves due to different placement', () => {
            const placement2: GipfPlacement = new GipfPlacement(new Coord(1, -2),
                                                                MGPOptional.of(HexaDirection.DOWN_LEFT));
            const move2: GipfMove = new GipfMove(placement2, [initialCapture], [finalCapture]);
            expect(move.equals(move2)).toBeFalse();
        });

        it('should consider moves different due to different capture sizes', () => {
            const initialCapture2: GipfCapture = new GipfCapture([
                new Coord(1, -2), new Coord(0, -1), new Coord(-1, 0), new Coord(-2, 1),
            ]);
            const move2: GipfMove = new GipfMove(placement, [initialCapture, initialCapture2], [finalCapture]);
            expect(move.equals(move2)).toBeFalse();
        });

        it('should consider moves different due to different initial capture', () => {
            const initialCapture2: GipfCapture = new GipfCapture([
                new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0), new Coord(-3, 1),
            ]);
            const move2: GipfMove = new GipfMove(placement, [initialCapture2], [finalCapture]);
            expect(move.equals(move2)).toBeFalse();
        });

        it('should consider moves different due to different final capture', () => {
            const finalCapture2: GipfCapture = new GipfCapture([
                new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1), new Coord(0, 2),
            ]);
            const move2: GipfMove = new GipfMove(placement, [initialCapture], [finalCapture2]);
            expect(move.equals(move2)).toBeFalse();
        });

        it('should consider move different to the move with a different order of capture', () => {
            const initialCapture2: GipfCapture = new GipfCapture([
                new Coord(1, -2), new Coord(1, -1), new Coord(1, 0), new Coord(1, 1),
            ]);
            const move1: GipfMove = new GipfMove(placement, [initialCapture, initialCapture2], []);
            const move2: GipfMove = new GipfMove(placement, [initialCapture2, initialCapture], []);
            expect(move1.equals(move2)).toBeFalse();
        });

    });

});
