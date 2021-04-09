import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { Table } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { CoerceoPartSlice, CoerceoPiece } from './CoerceoPartSlice';

describe('CoerceoPartSlice', () => {
    describe('CoerceoPiece', () => {
        describe('playerOf', () => {
            it('Should throw when called with anything else than Player.ONE or Player.ZERO', () => {
                expect(() => CoerceoPiece.ofPlayer(Player.NONE))
                    .toThrowError('CoerceoPiece.ofPlayer can only be called with Player.ZERO and Player.ONE.');
            });
        });
    });
    describe('isDeconnectable', () => {
        it('Should not deconnect full circled tile', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, [0, 0], [0, 0]);
            spyOn(slice, 'getPresentNeighboorTilesIndexes').and.returnValue([0, 1, 2, 3, 4, 5]);
            expect(slice.isDeconnectable(null)).toBeFalse();
        });
        it('Should not deconnect splitted connection line', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, [0, 0], [0, 0]);
            spyOn(slice, 'getPresentNeighboorTilesIndexes').and.returnValue([0, 2, 3]);
            expect(slice.isDeconnectable(null)).toBeFalse();
        });
        it('Should deconnect when 3 adjacent side (normal)', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, [0, 0], [0, 0]);
            spyOn(slice, 'getPresentNeighboorTilesIndexes').and.returnValue([2, 3, 4]);
            expect(slice.isDeconnectable(null)).toBeTrue();
        });
        it('Should deconnect when 3 adjacent side (special 0)', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, [0, 0], [0, 0]);
            spyOn(slice, 'getPresentNeighboorTilesIndexes').and.returnValue([0, 1, 5]);
            expect(slice.isDeconnectable(null)).toBeTrue();
        });
        it('Should deconnect when 3 adjacent side (special 1)', () => {
            const slice: CoerceoPartSlice = new CoerceoPartSlice([], 0, [0, 0], [0, 0]);
            spyOn(slice, 'getPresentNeighboorTilesIndexes').and.returnValue([0, 4, 5]);
            expect(slice.isDeconnectable(null)).toBeTrue();
        });
    });
    it('getTilesUpperLeftCoord should assign correct value', () => {
        const A: Coord = new Coord(0, 0);
        const B: Coord = new Coord(3, -1);
        const C: Coord = new Coord(0, 2);
        const D: Coord = new Coord(3, 1);
        const coords: Table<Coord> = [
            [A, A, A, B, B, B],
            [A, A, A, D, D, D],
            [C, C, C, D, D, D],
        ];
        for (let y: number = 0; y < 3; y++) {
            for (let x: number = 0; x < 6; x++) {
                const expectedCoord: Coord = coords[y][x];
                const actualCoord: Coord = CoerceoPartSlice.getTilesUpperLeftCoord(new Coord(x, y));
                expect(actualCoord).toEqual(expectedCoord);
            }
        }
    });
});
