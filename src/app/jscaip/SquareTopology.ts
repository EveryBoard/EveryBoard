import { Coord } from './Coord';
import { Direction } from './Direction';
import { Ordinal } from './Ordinal';
import { Topology } from './Topology';

export class SquareTopology implements Topology {

    public constructor(public readonly width: number,
                       public readonly height: number,
    ) {
    }

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

    public getAllCoords(): Coord[] {
        const coords: Coord[] = [];
        for (let x: number = 0; x < this.width; x++) {
            for (let y: number = 0; y < this.height; y++) {
                coords.push(new Coord(x, y));
            }
        }
        return coords;
    }

}
