import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { CoerceoState } from '../CoerceoState';

describe('CoerceoState', () => {

    describe('isDeconnectable', () => {
        it('Should not deconnect tile with more than 3 neighboor (v _ _ v v v)', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0, 1, 2, 3, 4, 5]);
            expect(state.isDeconnectable(null)).toBeFalse();
        });
        it('Should deconnect when 3 adjacent neighboor (v v v _ _ _ )', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0, 1, 2]);
            expect(state.isDeconnectable(null)).toBeTrue();
        });
        it('Should not deconnect when 3 splitted neighboor (v v _ v _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0, 1, 3]);
            expect(state.isDeconnectable(null)).toBeFalse();
        });
        it('Should not deconnect when 3 splitted neighboor (v _ v v _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0, 2, 3]);
            expect(state.isDeconnectable(null)).toBeFalse();
        });
        it('Should deconnect when 2 adjacent neighboor (v v _ _ _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0, 1]);
            expect(state.isDeconnectable(null)).toBeTrue();
        });
        it('Should deconnect when 2 adjacent neighboor (v _ _ _ _ v)', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0, 5]);
            expect(state.isDeconnectable(null)).toBeTrue();
        });
        it('Should not deconnect when 2 non adjacent neighboor (v _ v _ _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0, 2]);
            expect(state.isDeconnectable(null)).toBeFalse();
        });
        it('Should deconnect when only one neighboor', () => {
            const state: CoerceoState = new CoerceoState([], 0, [0, 0], [0, 0]);
            spyOn(state, 'getPresentNeighboorTilesRelativeIndexes').and.returnValue([0]);
            expect(state.isDeconnectable(null)).toBeTrue();
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
                const actualCoord: Coord = CoerceoState.getTilesUpperLeftCoord(new Coord(x, y));
                expect(actualCoord).toEqual(expectedCoord);
            }
        }
    });
});
