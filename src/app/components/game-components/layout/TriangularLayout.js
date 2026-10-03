import { Coord } from '@everyboard/games';
import { BaseLayout } from './Layout';
export class TriangularLayout extends BaseLayout {
    size;
    constructor(size) {
        super();
        this.size = size;
    }
    getTranslationCoordAt(coord) {
        return new Coord(coord.x * this.size * 0.5, coord.y * this.size);
    }
    isDownward(c) {
        return (c.x + c.y) % 2 === 1;
    }
    getPolygonCoordsAt(coord) {
        if (this.isDownward(coord)) {
            return [
                new Coord(0, 0),
                new Coord(this.size, 0),
                new Coord(this.size / 2, this.size),
            ];
        }
        else {
            return [
                new Coord(0, this.size),
                new Coord(this.size, this.size),
                new Coord(this.size / 2, 0),
            ];
        }
    }
}
