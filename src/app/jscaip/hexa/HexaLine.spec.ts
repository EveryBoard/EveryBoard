import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { Coord } from '../coord/Coord';
import { HexaDirection } from './HexaDirection';
import { HexaLine } from './HexaLine';

describe('HexaLine', () => {
    describe('fromTwoCoords', () => {
        it('should create a line from two coordinates', () => {
            const line1: MGPOptional<HexaLine> = HexaLine.fromTwoCoords(new Coord(-3, 0), new Coord(-3, 1));
            expect(line1.isPresent()).toBeTrue();
            const line2: MGPOptional<HexaLine> = HexaLine.fromTwoCoords(new Coord(-3, 2), new Coord(-3, 3));
            expect(line2.isPresent()).toBeTrue();

            expect(line1.get().equals(line2.get())).toBeTrue();
        });
        it('should not create invalid lines', () => {
            const line: MGPOptional<HexaLine> = HexaLine.fromTwoCoords(new Coord(-3, 1), new Coord(-1, 0));
            expect(line.isPresent()).toBeFalse();
        });
        it('should not create a line if the two coordinates are the same', () => {
            const line: MGPOptional<HexaLine> = HexaLine.fromTwoCoords(new Coord(-3, 1), new Coord(-3, 1));
            expect(line.isPresent()).toBeFalse();
        });
    });
    describe('allLines', () => {
        it('should countain 21 different lines when radius is 3', () => {
            const lines: ReadonlyArray<HexaLine> = HexaLine.allLines(3);
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
            expect(HexaLine.areOnSameLine([new Coord(0, -3)])).toBeTrue();
        });
        it('should detect when coords are on the same line', () => {
            const coords: Coord[] = [new Coord(0, -3), new Coord(0, -1), new Coord(0, 2), new Coord(0, 1)];
            expect(HexaLine.areOnSameLine(coords)).toBeTrue();
        });
        it('should detect when coords are not on the same line', () => {
            const coords: Coord[] = [new Coord(0, -3), new Coord(0, -1), new Coord(1, 2), new Coord(0, 1)];
            expect(HexaLine.areOnSameLine(coords)).toBeFalse();
        });
    });

    describe('contains', () => {
        it('should detect when a coordinate is contained in a line', () => {
            const line: HexaLine = HexaLine.constantQ(-3);
            const coord: Coord = new Coord(-3, 3);
            expect(line.contains(coord)).toBeTrue();
        });
        it('should detect when a coordinate is not contained in a line', () => {
            const line: HexaLine = HexaLine.constantQ(-3);
            const coord: Coord = new Coord(-2, 2);
            expect(line.contains(coord)).toBeFalse();
        });
    });
    describe('getEntrance', () => {
        it('should return the correct entrance for lines with a constant q', () => {
            const line: HexaLine = HexaLine.constantQ(-3);
            expect(line.getEntrance().equals(new Coord(-3, 0))).toBeTrue();
        });
        it('should return the correct entrance for lines with a constant r', () => {
            const line: HexaLine = HexaLine.constantR(-2);
            expect(line.getEntrance().equals(new Coord(-1, -2))).toBeTrue();
        });
        it('should return the correct entrance for lines with a constant s', () => {
            const line: HexaLine = HexaLine.constantS(1);
            expect(line.getEntrance().equals(new Coord(2, -3))).toBeTrue();
        });
    });

    describe('getDirection', () => {
        it('should consider lines with constant q going down', () => {
            expect(HexaLine.constantQ(-3).getDirection()).toEqual(HexaDirection.DOWN);
        });
        it('should consider lines with constant r going down right', () => {
            expect(HexaLine.constantR(-3).getDirection()).toEqual(HexaDirection.DOWN_RIGHT);
        });
        it('should consider lines with constant s going down left', () => {
            expect(HexaLine.constantS(-3).getDirection()).toEqual(HexaDirection.DOWN_LEFT);
        });
    });
});

