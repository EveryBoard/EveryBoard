import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Ordinal } from '../Ordinal';

import { Topology } from './Topology';

export class SquareTopology implements Topology {

    public getDirections(): Direction[] {
        return [
            Ordinal.UP,
            Ordinal.UP_RIGHT,
            Ordinal.RIGHT,
            Ordinal.DOWN_RIGHT,
        ];
    }

    public getNextCoord(coord: Coord, direction: Direction): Coord {
        return coord.getNext(direction);
    }

    public getNeighbors(coord: Coord): Coord[] {
        return this.getDirections().map(
            (direction: Direction) => this.getNextCoord(coord, direction),
        );
    }

}
