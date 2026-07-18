import { Coord } from '../Coord';
import { Vector } from '../Vector';

import { Shape } from './Shape';

export class TriangularShape implements Shape {

    public constructor(
        public readonly side: number,
    ) {
    }

    public getCenters(): Coord[] {
        const cxList: number[] = this.getIntegerMeans(this.side);
        const centers: Coord[] = [];
        for (const cx of cxList) {
            for (const cy of cxList) {
                centers.push(new Coord(cx, cy)); // TODO: unit test and behavior check
            }
        }
        return centers;
    }

    private getIntegerMeans(value: number): number[] {
        const half: number = value / 2;
        if (value % 2 === 0) {
            return [half];
        } else {
            return [
                Math.floor(half),
                Math.ceil(half),
            ];
        }
    }

    public getAllCoords(): Coord[] { // TODO: remove UNREACHABLE within or without the board ?
        const coords: Coord[] = [];
        for (let x: number = 0; x < this.side; x++) {
            for (let y: number = 0; y < this.side; y++) {
                coords.push(new Coord(x, y));
            }
        }
        return coords;
    }

    public getNextCoord(coord: Coord, direction: Vector): Coord {
        return new Coord(0, 0); // TODO
    }

}
