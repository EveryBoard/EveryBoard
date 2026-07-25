import { Coord } from '../Coord';
import { Topology } from '../topology/Topology';

import { Shape, TopologicShape } from './Shape';

export class TriangularShape extends TopologicShape implements Shape {

    public constructor(
        public readonly side: number,
        topology: Topology,
    ) {
        super(topology);
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

    public getAllCoords(): Coord[] {
        const evenOffset: number = this.side % 2 === 0 ? 1 : 0;
        const coords: Coord[] = [];
        const minyx: number = this.side - 1;
        const maxIndex: number = (this.side - 1) * 2;
        for (let x: number = 0; x <= maxIndex; x++) {
            for (let y: number = 0; y < this.side; y++) {
                if (minyx <= x + y && x - y < this.side) {
                    coords.push(new Coord(evenOffset + x, y));
                }
            }
        }
        return coords;
    }

}
