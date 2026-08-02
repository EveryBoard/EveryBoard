import { Coord } from '../Coord';
import { Topology } from '../topology/Topology';

import { TopologicShape } from './Shape';

export class RectangularShape extends TopologicShape {

    public constructor(
        public readonly width: number,
        public readonly height: number,
        topology: Topology,
    ) {
        super(topology);
    }

    public getCenters(): Coord[] {
        const cxList: number[] = this.getIntegerMeans(this.width);
        const cyList: number[] = this.getIntegerMeans(this.height);
        const centers: Coord[] = [];
        for (const cx of cxList) {
            for (const cy of cyList) {
                centers.push(new Coord(cx, cy));
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
