import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Ordinal } from '../Ordinal';

import { Topology } from './Topology';

export class HexagonalTopology implements Topology {

    public getDirections(): Direction[] {
        return [
            Ordinal.UP_RIGHT,
            Ordinal.RIGHT,
            Ordinal.DOWN,
        ];
    }

    public getNextCoord(coord: Coord, direction: Direction): Coord {
        return coord.getNext(direction);
    }

    public getNeighbors(coord: Coord): Coord[] {
        return this.getDirections().map(
            (direction: Direction) => this.getNextCoord(coord, direction),
            // TODO: unit test that there is 6 neighbors (cause RN there is 3 here and 4 in SquareTopology and it sucks dick)
        );
    }

}
