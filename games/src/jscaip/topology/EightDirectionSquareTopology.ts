import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { EightDirection } from '../direction/EightDirection';

import { Topology } from './Topology';

export class EightDirectionSquareTopology implements Topology<EightDirection> {

    private readonly directions: Set<EightDirection> = new Set([
        EightDirection.UP,
        EightDirection.UP_RIGHT,
        EightDirection.RIGHT,
        EightDirection.DOWN_RIGHT,
        EightDirection.DOWN,
        EightDirection.DOWN_LEFT,
        EightDirection.LEFT,
        EightDirection.UP_LEFT,
    ]);

    public getDirections(): Set<EightDirection> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: EightDirection, distance: number = 1): Coord {
        return coord.getNext(direction, distance);
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            ...this.getDirections().map(
                (direction: EightDirection) => this.getNextCoord(coord, direction),
            ),
        ]);
    }

}
