import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { EightDirection } from '../EightDirection';

import { Topology } from './Topology';

export class EightDirectionSquareTopology implements Topology<EightDirection> {

    private readonly directions: Set<Direction> = new Set([
        EightDirection.UP,
        EightDirection.UP_RIGHT,
        EightDirection.RIGHT,
        EightDirection.DOWN_RIGHT,
        EightDirection.DOWN,
        EightDirection.DOWN_LEFT,
        EightDirection.LEFT,
        EightDirection.UP_LEFT,
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
