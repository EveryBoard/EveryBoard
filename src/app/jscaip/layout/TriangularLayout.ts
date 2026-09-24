import { Coord } from '../Coord';

import { BaseLayout } from './Layout';

export class TriangularLayout extends BaseLayout {

    public constructor(
        public readonly size: number,
    ) {
        super();
    }

    public override getTranslationCoordAt(coord: Coord): Coord {
        return new Coord(
            coord.x * this.size * 0.5,
            coord.y * this.size,
        );
    }

    private isDownward(c: Coord): boolean {
        return (c.x + c.y) % 2 === 1;
    }

    public override getPolygonCoordsAt(coord: Coord): Coord[] {
        if (this.isDownward(coord)) {
            return [
                new Coord(0, 0),
                new Coord(this.size, 0),
                new Coord(this.size / 2, this.size),
            ];
        } else {
            return [
                new Coord(0, this.size),
                new Coord(this.size, this.size),
                new Coord(this.size / 2, 0),
            ];
        }
    }

}
