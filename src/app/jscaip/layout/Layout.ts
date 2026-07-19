import { Coord } from '../Coord';

export interface Layout {

    getTranslationAt(coord: Coord): string;

    getPolygonAt(coord: Coord): string;

}
