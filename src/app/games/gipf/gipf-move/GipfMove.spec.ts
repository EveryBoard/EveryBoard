import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { GipfCapture, GipfLine, GipfMove, GipfPlacement } from './GipfMove';

describe('GipfLine', () => {
    describe('fromTwoCoords', () => {
        it('should create a line from two coordinates', () => {
            const line1: MGPOptional<GipfLine> = GipfLine.fromTwoCoords(new Coord(-3, 0), new Coord(-3, 1));
            expect(line1.isPresent()).toBeTrue();
            const line2: MGPOptional<GipfLine> = GipfLine.fromTwoCoords(new Coord(-3, 2), new Coord(-3, 3));
            expect(line2.isPresent()).toBeTrue();

            expect(line1.get().equals(line2.get())).toBeTrue();
        });
        it('should not create invalid lines', () => {
            const line: MGPOptional<GipfLine> = GipfLine.fromTwoCoords(new Coord(-3, 1), new Coord(-1, 0));
            expect(line.isPresent()).toBeFalse();
        });
        it('should not create a line if the two coordinates are the same', () => {
            const line: MGPOptional<GipfLine> = GipfLine.fromTwoCoords(new Coord(-3, 1), new Coord(-3, 1));
            expect(line.isPresent()).toBeFalse();
        });
    });
    describe('allLines', () => {
        it('should countain X different lines', () => {
            const lines: ReadonlyArray<GipfLine> = GipfLine.allLines();
            expect(lines.length).toEqual(21);
            for (const line1 of lines) {
                let eq: number = 0;
                for (const line2 of lines) {
                    if (line1.equals(line2)) {
                        eq += 1;
                    }
                }
                // Line should be unique
                expect(eq).toEqual(1);
            }
        });
    });

    describe('areOnSameLine', () => {
        it('should consider a single coord to be on the same line as itself', () => {
            expect(GipfLine.areOnSameLine([new Coord(0, -3)])).toBeTrue();
        });
        it('should detect when coords are on the same line', () => {
            const coords: Coord[] = [new Coord(0, -3), new Coord(0, -1), new Coord(0, 2), new Coord(0, 1)];
            expect(GipfLine.areOnSameLine(coords)).toBeTrue();
        });
        it('should detect when coords are not on the same line', () => {
            const coords: Coord[] = [new Coord(0, -3), new Coord(0, -1), new Coord(1, 2), new Coord(0, 1)];
            expect(GipfLine.areOnSameLine(coords)).toBeFalse();
        });
    });

    describe('contains', () => {
        it('should detect when a coordinate is contained in a line', () => {
            const line: GipfLine = GipfLine.constantQ(-3);
            const coord: Coord = new Coord(-3, 3);
            expect(line.contains(coord)).toBeTrue();
        });
        it('should detect when a coordinate is not contained in a line', () => {
            const line: GipfLine = GipfLine.constantQ(-3);
            const coord: Coord = new Coord(-2, 2);
            expect(line.contains(coord)).toBeFalse();
        });
    });

    describe('getEntrance', () => {
        it('should return the correct entrance for lines with a constant q', () => {
            const line: GipfLine = GipfLine.constantQ(-3);
            expect(line.getEntrance().equals(new Coord(-3, 0))).toBeTrue();
        });
        it('should return the correct entrance for lines with a constant r', () => {
            const line: GipfLine = GipfLine.constantR(-2);
            expect(line.getEntrance().equals(new Coord(-1, -2))).toBeTrue();
        });
        it('should return the correct entrance for lines with a constant s', () => {
            const line: GipfLine = GipfLine.constantS(1);
            expect(line.getEntrance().equals(new Coord(2, -3))).toBeTrue();
        });
    });

    describe('getDirection', () => {
        it('should consider lines with constant q going down', () => {
            expect(GipfLine.constantQ(-3).getDirection()).toEqual(HexaDirection.DOWN);
        });
        it('should consider lines with constant r going down right', () => {
            expect(GipfLine.constantR(-3).getDirection()).toEqual(HexaDirection.DOWN_RIGHT);
        });
        it('should consider lines with constant s going down left', () => {
            expect(GipfLine.constantS(-3).getDirection()).toEqual(HexaDirection.DOWN_LEFT);
        });
    });
});

describe('GipfCapture', () => {
    it('should not allow construction of captures smaller than 4', () => {
        const coords: Coord[] = [new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1)];
        expect(() => new GipfCapture(coords)).toThrow();
    });
    it('should not allow construction with pieces not on the same line', () => {
        const coords: Coord[] = [new Coord(-1, 0), new Coord(0, 1), new Coord(1, 0), new Coord(2, 0)];
        expect(() => new GipfCapture(coords)).toThrow();
    });
    it('should allow construction of valid capture', () => {
        const coords: Coord[] = [
            new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0), new Coord(2, 0), new Coord(3, 0),
        ];
        expect(() => new GipfCapture(coords)).not.toThrow();
    });
    describe('encoder', () => {
        it('should correctly encode and decode captures of length 4', () => {
            const capture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            expect(GipfCapture.encoder.decode(GipfCapture.encoder.encode(capture)).equals(capture)).toBeTrue();
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
            capture.forEach((_c: Coord) => {
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
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            const line: GipfLine = GipfLine.constantS(2);
            expect(capture.getLine().equals(line)).toBeTrue();
        });
    });
});

describe('GipfPlacement', () => {
    describe('encoder', () => {
        it('should correctly encode and decode placements with a direction', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.of(HexaDirection.DOWN));
            expect(GipfPlacement.encoder.decode(GipfPlacement.encoder.encode(placement)).equals(placement)).toBeTrue();
        });
        it('should correctly encode and decode placements without a direction', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0), MGPOptional.empty());
            expect(GipfPlacement.encoder.decode(GipfPlacement.encoder.encode(placement)).equals(placement)).toBeTrue();
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
                                                                MGPOptional.of(HexaDirection.DOWN_RIGHT));
            expect(placement1.equals(placement2)).toBeFalse();
            expect(placement1.equals(placement3)).toBeFalse();
        });
    });
});

describe('GipfMove', () => {
    describe('encoder', () => {
        it('should correctly encode and decode moves with only a placement', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN));
            const move: GipfMove = new GipfMove(placement, [], []);
            expect(GipfMove.encoder.decode(GipfMove.encoder.encode(move)).equals(move)).toBeTrue();
        });
        // Disabled because it loses precision on the encoded number
        xit('should correctly encode and decode moves with captures before and after', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, -3),
                                                               MGPOptional.of(HexaDirection.DOWN_LEFT));
            const initialCapture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            const finalCapture: GipfCapture = new GipfCapture([
                new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1),
            ]);
            const move: GipfMove = new GipfMove(placement, [initialCapture], [finalCapture]);
            expect(GipfMove.encoder.decode(GipfMove.encoder.encode(move)).equals(move)).toBeTrue();
        });
        // Disabled because it loses precision on the encoded number
        xit('should correctly encode and decode moves with multiple captures before', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, -3),
                                                               MGPOptional.of(HexaDirection.DOWN_LEFT));
            const capture1: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            const capture2: GipfCapture = new GipfCapture([
                new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1),
            ]);
            const move: GipfMove = new GipfMove(placement, [capture1, capture2], []);
            expect(GipfMove.encoder.decode(GipfMove.encoder.encode(move)).equals(move)).toBeTrue();
        });
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
        it('should detect equal moves', () => {
            expect(move.equals(move)).toBeTrue();
        });
        it('should detect different moves due to different placement', () => {
            const placement2: GipfPlacement = new GipfPlacement(new Coord(1, -2),
                                                                MGPOptional.of(HexaDirection.DOWN_LEFT));
            const move2: GipfMove = new GipfMove(placement2, [initialCapture], [finalCapture]);
            expect(move.equals(move2)).toBeFalse();
        });
        it('should detect different moves due to different initial capture', () => {
            const initialCapture2: GipfCapture = new GipfCapture([
                new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0), new Coord(-3, 1),
            ]);
            const move2: GipfMove = new GipfMove(placement, [initialCapture2], [finalCapture]);
            expect(move.equals(move2)).toBeFalse();
        });
        it('should detect different moves due to different final capture', () => {
            const finalCapture2: GipfCapture = new GipfCapture([
                new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1), new Coord(0, 2),
            ]);
            const move2: GipfMove = new GipfMove(placement, [initialCapture], [finalCapture2]);
            expect(move.equals(move2)).toBeFalse();
        });
    });
    describe('toString', () => {
        it('should be overriden', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, -3),
                                                               MGPOptional.of(HexaDirection.DOWN_LEFT));
            const move: GipfMove = new GipfMove(placement, [], []);
            expect(move.toString()).toBe('GipfMove');
        });
    });
});
