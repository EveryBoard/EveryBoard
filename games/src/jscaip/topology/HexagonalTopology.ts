import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { HexaDirection } from '../HexaDirection';

import { Topology } from './Topology';

export class HexagonalTopology implements Topology<HexaDirection> {

    private readonly directions: Set<HexaDirection> = new Set([
        HexaDirection.UP_RIGHT,
        HexaDirection.RIGHT,
        HexaDirection.DOWN,
        HexaDirection.DOWN_LEFT,
        HexaDirection.LEFT,
        HexaDirection.UP,
    ]);

    public getDirections(): Set<HexaDirection> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: HexaDirection, distance: number = 1): Coord {
        return coord.getNext(direction, distance);
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            ...this.getDirections().map(
                (direction: HexaDirection) => this.getNextCoord(coord, direction),
            ),
            ...this.getDirections().map(
                (direction: HexaDirection) => this.getNextCoord(coord, direction, -1),
            ),
        ]);
    }

}
