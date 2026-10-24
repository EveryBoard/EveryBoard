import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { TriangularDirection } from '../direction/TriangularDirection';
import { Vector } from '../Vector';

import { Topology } from './Topology';

export class TriangularTopology implements Topology<TriangularDirection> {

    private readonly directions: Set<TriangularDirection> = new Set([
        TriangularDirection.LEFT,
        TriangularDirection.UP_LEFT,
        TriangularDirection.UP_RIGHT,
        TriangularDirection.RIGHT,
        TriangularDirection.DOWN_RIGHT,
        TriangularDirection.DOWN_LEFT,
    ]);

    public getDirections(): Set<TriangularDirection> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: TriangularDirection, distance: number = 1): Coord {
        if (direction.y === 0) {
            return coord.getNext(direction, distance);
        }
        if (this.canGoUp(coord)) {
            if (direction.y === -1) {
                // TODO: twice in the same direction is tricky in triangles !
                return new Coord(coord.x, coord.y - distance);
            }
        } else {
            if (direction.y === 1) {
                return new Coord(coord.x, coord.y + distance);
            }
        }
        return coord.getNext(new Vector(direction.x, 0), distance);
    }

    private canGoUp(c: Coord): boolean {
        return (c.x + c.y) % 2 === 1;
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            coord.getNext(TriangularDirection.LEFT),
            coord.getNext(TriangularDirection.RIGHT),
            this.canGoUp(coord) ?
                new Coord(coord.x, coord.y - 1) :
                new Coord(coord.x, coord.y + 1),
        ]);
    }

}
