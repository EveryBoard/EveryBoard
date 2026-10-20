import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { EightDirection } from '../EightDirection';
import { TriangularDirection } from '../TriangularDirection';
import { Vector } from '../Vector';

import { Topology } from './Topology';

export class TriangularTopology implements Topology<TriangularDirection> {

    private readonly directions: Set<Direction> = new Set([
        TriangularDirection.LEFT,
        TriangularDirection.UP_LEFT,
        TriangularDirection.UP_RIGHT,
        TriangularDirection.RIGHT,
        TriangularDirection.DOWN_RIGHT,
        TriangularDirection.DOWN_LEFT,
    ]);

    public getDirections(): Set<Direction> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: TriangularDirection, distance: number = 1): Coord {
        if (direction.y === 0) { // No weird behavior for LEFT and RIGHT
            return coord.getNext(direction, distance);
        }
        if (this.canGoUp(coord)) {
            if (direction.y === -1) {
                return coord.getNext(EightDirection.UP, distance);
            }
        } else {
            if (direction.y === 1) {
                return coord.getNext(EightDirection.DOWN, distance);
            }
        }
        return coord.getNext(new Vector(direction.x, 0), distance);
    }

    private canGoUp(c: Coord): boolean {
        return (c.x + c.y) % 2 === 1;
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            coord.getNext(EightDirection.LEFT),
            coord.getNext(EightDirection.RIGHT),
            this.canGoUp(coord) ? coord.getNext(EightDirection.UP) : coord.getNext(EightDirection.DOWN),
        ]);
    }

}
