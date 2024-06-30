/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/jscaip/TableUtils';
import { CoerceoState } from '../CoerceoState';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

describe('CoerceoState', () => {

    describe('isDeconnectable', () => {
        const dummyCoord: Coord = new Coord(-1, -1);

        it('should not deconnect tile with more than 3 neighbor (v _ _ v v v)', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0, 1, 2, 3, 4, 5]);
            expect(state.isDeconnectable(dummyCoord)).toBeFalse();
        });

        it('should deconnect when 3 adjacent neighbor (v v v _ _ _ )', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0, 1, 2]);
            expect(state.isDeconnectable(dummyCoord)).toBeTrue();
        });

        it('should not deconnect when 3 split neighbor (v v _ v _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0, 1, 3]);
            expect(state.isDeconnectable(dummyCoord)).toBeFalse();
        });

        it('should not deconnect when 3 split neighbor (v _ v v _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0, 2, 3]);
            expect(state.isDeconnectable(dummyCoord)).toBeFalse();
        });

        it('should deconnect when 2 adjacent neighbor (v v _ _ _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0, 1]);
            expect(state.isDeconnectable(dummyCoord)).toBeTrue();
        });

        it('should deconnect when 2 adjacent neighbor (v _ _ _ _ v)', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0, 5]);
            expect(state.isDeconnectable(dummyCoord)).toBeTrue();
        });

        it('should not deconnect when 2 non adjacent neighbor (v _ v _ _ _)', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0, 2]);
            expect(state.isDeconnectable(dummyCoord)).toBeFalse();
        });

        it('should deconnect when only one neighbor', () => {
            const state: CoerceoState = new CoerceoState([], 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));
            spyOn(state, 'getPresentNeighborTilesRelativeIndices').and.returnValue([0]);
            expect(state.isDeconnectable(dummyCoord)).toBeTrue();
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
