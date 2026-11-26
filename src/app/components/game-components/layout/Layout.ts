import { Coord } from '@everyboard/games';


export abstract class Layout {

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
