import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Ordinal } from '../Ordinal';
import { Vector } from '../Vector';

import { Topology } from './Topology';

export class TriangularTopology implements Topology {

    private readonly directions: Set<Direction> = new Set([
        Ordinal.UP_RIGHT,
        Ordinal.RIGHT,
        Ordinal.DOWN_RIGHT,
    ]);

    public getDirections(): Set<Direction> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: Direction, distance: number = 1): Coord {
        if (direction.y === 0) {
            return coord.getNext(direction, distance);
        }
        if (this.canGoUp(coord)) {
            if (direction.y === -1) {
                return coord.getNext(Ordinal.UP, distance);
            }
        } else {
            if (direction.y === 1) {
                return coord.getNext(Ordinal.DOWN, distance);
            }
        }
        return coord.getNext(new Vector(direction.x, 0), distance);
    }

    private canGoUp(c: Coord): boolean {
        return (c.x + c.y) % 2 === 1;
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            coord.getNext(Ordinal.LEFT),
            coord.getNext(Ordinal.RIGHT),
            this.canGoUp(coord) ? coord.getNext(Ordinal.UP) : coord.getNext(Ordinal.DOWN),
        ]);
    }

}
