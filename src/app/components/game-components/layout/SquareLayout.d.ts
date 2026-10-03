import { Coord } from '@everyboard/games';
import { BaseLayout } from './Layout';
export declare class SquareLayout extends BaseLayout {
    readonly size: number;
    constructor(size: number);
    getTranslationCoordAt(coord: Coord): Coord;
    getPolygonCoordsAt(_: Coord): Coord[];
}
