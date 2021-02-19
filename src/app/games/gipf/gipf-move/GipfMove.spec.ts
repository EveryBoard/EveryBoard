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

    describe('areOnSameLine', () => {
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
            expect(line.getEntrance().equals(new Coord(-3, 0)));
        });
        it('should return the correct entrance for lines with a constant r', () => {
            const line: GipfLine = GipfLine.constantR(-2);
            expect(line.getEntrance().equals(new Coord(-1, -2)));
        });
        it('should return the correct entrance for lines with a constant s', () => {
            const line: GipfLine = GipfLine.constantS(1);
            expect(line.getEntrance().equals(new Coord(2, -3)));
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

describe('GipfMove', () => {
    xdescribe('encoder', () => {
        it('should correctly encode and decode simple moves with only a placement', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN), false);
            const move: GipfMove = new GipfMove(placement, [], []);
            expect(GipfMove.encoder.decode(GipfMove.encoder.encode(move)).equals(move)).toBeTrue();
        });
        it('should correctly encode and decode double moves with only a placement', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-1, 2),
                                                               MGPOptional.of(HexaDirection.DOWN_RIGHT), true);
            const move: GipfMove = new GipfMove(placement, [], []);
            expect(GipfMove.encoder.decode(GipfMove.encoder.encode(move)).equals(move)).toBeTrue();
        });
        it('should correctly encode and decode simple moves with captures before and after', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, -3),
                                                               MGPOptional.of(HexaDirection.DOWN_LEFT), false);
            const initialCapture: GipfCapture = new GipfCapture([
                new Coord(1, -3), new Coord(0, -2), new Coord(-1, -1), new Coord(-2, 0),
            ]);
            const finalCapture: GipfCapture = new GipfCapture([
                new Coord(0, -3), new Coord(0, -2), new Coord(0, -1), new Coord(0, 0), new Coord(0, 1),
            ]);
            const move: GipfMove = new GipfMove(placement, [initialCapture], [finalCapture]);
            expect(GipfMove.encoder.decode(GipfMove.encoder.encode(move)).equals(move)).toBeTrue();
        });
        it('should correctly encode and decode simple moves with multiple captures before', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, -3),
                                                               MGPOptional.of(HexaDirection.DOWN_LEFT), false);
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
});
