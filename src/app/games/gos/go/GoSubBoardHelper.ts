import { Table, TableUtils } from '../../../jscaip/TableUtils';

export class GoSubBoardHelper {

    public static splitInSubBoards<T>(table: Table<T>, zoomMax: number): ReadonlyArray<Table<Table<T>>> {
        const zooms: Array<Table<Table<T>>> = [];
        for (let zoom: number = 1; zoom <= zoomMax; zoom++) {
            zooms.push(
                GoSubBoardHelper.splitInSubBoardsForZoom(table, zoom),
            );
        }
        return zooms;
    }

    public static splitInSubBoardsForZoom<T>(table: Table<T>, zoom: number): Table<Table<T>> {
        const initialWidth: number = table[0].length;
        const initialHeight: number = table.length;
        const numberOfSubColumns: number = Math.min(initialWidth, zoom);
        const numberOfSubRows: number = Math.min(initialHeight, zoom);
        const resultingSubBoards: Array<Array<Table<T>>> =
            TableUtils.create(numberOfSubColumns, numberOfSubRows, []);
        for (let x: number = 0; x < numberOfSubColumns; x++) {
            for (let y: number = 0; y < numberOfSubRows; y++) {
                resultingSubBoards[y][x] = GoSubBoardHelper.populateSubBoardFrom(table, x, y, zoom);
            }
        }
        return resultingSubBoards;
    }

    public static populateSubBoardFrom<T>(table: Table<T>, ix: number, iy: number, zoom: number): Table<T> {
        if (zoom === 1) {
            return table;
        }
        const width: number = table[0].length;
        const height: number = table.length;
        const subBoard: Array<Array<T>> = [];
        let resultY: number = -1;
        for (let y: number = iy; y < height; y += zoom) {
            subBoard.push([]);
            resultY++;
            for (let x: number = ix; x < width; x += zoom) {
                subBoard[resultY].push(table[y][x]);
            }
        }
        return subBoard;
    }
}
