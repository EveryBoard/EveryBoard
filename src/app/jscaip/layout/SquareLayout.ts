import { Coord } from '../Coord';

import { BaseLayout } from './Layout';

export class SquareLayout extends BaseLayout {

    public constructor(
        public readonly size: number,
    ) {
        super();
    }

    public override getTranslationCoordAt(coord: Coord): Coord {
        return new Coord(
            coord.x * this.size,
            coord.y * this.size,
        );
    }

    public override getPolygonCoordsAt(_: Coord): Coord[] {
        return [
            new Coord(0, 0),
            new Coord(0, this.size),
            new Coord(this.size, this.size),
            new Coord(this.size, 0),
        ];
    }

}
