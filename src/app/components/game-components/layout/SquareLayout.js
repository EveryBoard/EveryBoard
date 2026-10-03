import { Coord } from '@everyboard/games';
import { BaseLayout } from './Layout';
export class SquareLayout extends BaseLayout {
    size;
    constructor(size) {
        super();
        this.size = size;
    }
    getTranslationCoordAt(coord) {
        return new Coord(coord.x * this.size, coord.y * this.size);
    }
    getPolygonCoordsAt(_) {
        return [
            new Coord(0, 0),
            new Coord(0, this.size),
            new Coord(this.size, this.size),
            new Coord(this.size, 0),
        ];
    }
}
