import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Ordinal } from '../Ordinal';

import { Topology } from './Topology';

export class SquareTopology implements Topology<Ordinal> {

    private readonly directions: Set<Direction> = new Set([
        Ordinal.UP,
        Ordinal.UP_RIGHT,
        Ordinal.RIGHT,
        Ordinal.DOWN_RIGHT,
        Ordinal.DOWN,
        Ordinal.DOWN_LEFT,
        Ordinal.LEFT,
        Ordinal.UP_LEFT,
    ]);

    public getDirections(): Set<Direction> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: Direction, distance: number = 1): Coord {
        return coord.getNext(direction, distance);
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            ...this.getDirections().map(
                (direction: Direction) => this.getNextCoord(coord, direction),
            ),
            ...this.getDirections().map(
                (direction: Direction) => this.getNextCoord(coord, direction, -1),
            ),
        ]);
    }

}
