import { Coord } from '@everyboard/games';
import { BaseLayout } from './Layout';
export declare class TriangularLayout extends BaseLayout {
    readonly size: number;
    constructor(size: number);
    getTranslationCoordAt(coord: Coord): Coord;
    private isDownward;
    getPolygonCoordsAt(coord: Coord): Coord[];
}
