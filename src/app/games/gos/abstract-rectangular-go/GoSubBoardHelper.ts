import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { Table, TableUtils } from '../../../jscaip/TableUtils';
import { Vector } from '../../../jscaip/Vector';

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

    public static fromZoomedToNormalCoord(zoomedCoord: Coord, zx: number, zy: number, zoom: number): Coord {
        const oneBasedZoom: number = zoom + 1;
        return new Coord(
            zx + (zoomedCoord.x * oneBasedZoom),
            zy + (zoomedCoord.y * oneBasedZoom),
        );
    }

    public static fromNormalToZoomedCoord(
        normalCoord: Coord,
        zx: number,
        zy: number,
        zoom: number,
    ): MGPOptional<Coord> {
        const zoomVector: Vector = new Vector(zx, zy);
        const offsetCoord: Coord = normalCoord.getNext(zoomVector, -1);
        const oneBasedZoom: number = zoom + 1;
        if (offsetCoord.x % oneBasedZoom === 0 && offsetCoord.y % oneBasedZoom === 0) {
            return MGPOptional.of(new Coord(
                offsetCoord.x / oneBasedZoom,
                offsetCoord.y / oneBasedZoom,
            ));
        } else {
            return MGPOptional.empty();
        }
    }

    public static fromNormalToOptionalZoomedCoord(
        coord: MGPOptional<Coord>,
        zx: number,
        zy: number,
        zoom: number,
    ): MGPOptional<Coord> {
        if (coord.isPresent()) {
            return GoSubBoardHelper.fromNormalToZoomedCoord(
                coord.get(),
                zx,
                zy,
                zoom,
            );
        } else {
            return MGPOptional.empty();
        }
    }
}
