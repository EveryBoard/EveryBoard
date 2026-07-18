import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Ordinal } from '../Ordinal';
import { Vector } from '../Vector';

import { Topology } from './Topology';

export class TriangularTopology implements Topology {

    public getDirections(): Direction[] {
        return [
            Ordinal.UP_RIGHT,
            Ordinal.RIGHT,
            Ordinal.DOWN_RIGHT,
        ];
    }

    public getNextCoord(coord: Coord, direction: Direction): Coord {
        if (direction.y === 0) {
            return coord.getNext(direction);
        }
        if (this.canGoUp(coord)) {
            if (direction.y === -1) {
                return coord.getNext(Ordinal.UP);
            }
        } else {
            if (direction.y === 1) {
                return coord.getNext(Ordinal.DOWN);
            }
        }
        return coord.getNext(new Vector(direction.x, 0));
    }

    private canGoUp(c: Coord): boolean {
        return (c.x + c.y) % 2 === 1;
    }

    public getNeighbors(coord: Coord): Coord[] {
        return [
            coord.getNext(Ordinal.LEFT),
            coord.getNext(Ordinal.RIGHT),
            this.canGoUp(coord) ? coord.getNext(Ordinal.UP) : coord.getNext(Ordinal.DOWN),
        ];
    }

}
