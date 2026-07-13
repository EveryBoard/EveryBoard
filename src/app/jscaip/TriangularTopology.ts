import { Coord } from './Coord';
import { Direction } from './Direction';
import { Ordinal } from './Ordinal';
import { Vector } from './Vector';

import { Topology } from './Topology';

export class TriangularTopology implements Topology {

    public constructor(public readonly width: number,
                       public readonly height: number,
    ) {
    }

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

    public getAllCoords(): Coord[] { // TODO: remove UNREACHABLE within or without the board ?
        const coords: Coord[] = [];
        for (let x: number = 0; x < this.width; x++) {
            for (let y: number = 0; y < this.height; y++) {
                coords.push(new Coord(x, y));
            }
        }
        return coords;
    }

}
