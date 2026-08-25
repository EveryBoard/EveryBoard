/* eslint-disable max-lines-per-function */
import { Table } from '../../../jscaip/TableUtils';

import { GoSubBoardHelper } from './GoSubBoardHelper';

describe('GoSubBoardHelper', () => {

    describe('splitInSubBoardsForZoom', () => {

        describe('width/height not multiple of zoom', () => {
            const zoom: number = 3;
            const table: Table<number> = [
                [11, 21, 31, 41, 51, 61, 71],
                [12, 22, 32, 42, 52, 62, 72],
                [13, 23, 33, 43, 53, 63, 73],
                [14, 24, 34, 44, 54, 64, 74],
                [15, 25, 35, 45, 55, 65, 75],
                [16, 26, 36, 46, 56, 66, 76],
                [17, 27, 37, 47, 57, 67, 77],
            ];

            it('should give correct sub-boards', () => {
                // Given a board whose height and width are not multiple of the zoom
                // When splitting in subboards
                // Then they should contain the correct initial values
                const result: Table<Table<number>> = GoSubBoardHelper.splitInSubBoardsForZoom(table, zoom);
                expect(result.length).toBe(3);
                expect(result[0].length).toBe(3);

                const subBoard00: Table<number> = result[0][0];
                expect(subBoard00).withContext('sub board (0, 0)').toEqual([
                    [11, 41, 71],
                    [14, 44, 74],
                    [17, 47, 77],
                ]);

                const subBoard21: Table<number> = result[2][1];
                expect(subBoard21).withContext('sub board (1, 2)').toEqual([
                    [23, 53],
                    [26, 56],
                ]);

                const subBoard11: Table<number> = result[1][1];
                expect(subBoard11).withContext('sub board (1, 1)').toEqual([
                    [22, 52],
                    [25, 55],
                ]);
            });

        });

    });

});
