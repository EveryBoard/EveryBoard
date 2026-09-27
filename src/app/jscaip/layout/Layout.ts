import { Coord } from '../Coord';

export interface Layout {

    getTranslationCoordAt(coord: Coord): Coord;

    getTranslationAt(coord: Coord): string;

    getPolygonCoordsAt(coord: Coord): Coord[];

    getPolygonAt(coord: Coord): string;

}

export abstract class BaseLayout implements Layout {

    public abstract getTranslationCoordAt(coord: Coord): Coord;

    public getTranslationAt(coord: Coord): string {
        const translationCoord: Coord = this.getTranslationCoordAt(coord);
        return `translate(${ translationCoord.x }, ${ translationCoord.y })`;
    }

    public abstract getPolygonCoordsAt(coord: Coord): Coord[];

    public getPolygonAt(coord: Coord): string {
        return this.getPolygonCoordsAt(coord)
            .map((c: Coord) => c.x + ' ' + c.y)
            .join(' ');

    }

}
