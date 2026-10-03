import { Coord } from '@everyboard/games';
export interface Layout {
    getTranslationCoordAt(coord: Coord): Coord;
    getTranslationAt(coord: Coord): string;
    getPolygonCoordsAt(coord: Coord): Coord[];
    getPolygonAt(coord: Coord): string;
}
export declare abstract class BaseLayout implements Layout {
    abstract getTranslationCoordAt(coord: Coord): Coord;
    getTranslationAt(coord: Coord): string;
    abstract getPolygonCoordsAt(coord: Coord): Coord[];
    getPolygonAt(coord: Coord): string;
}
