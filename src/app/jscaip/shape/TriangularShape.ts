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
        const cxList: number[] = this.getHorizontalCenters();
        const cyList: number[] = this.getVerticalCenters();
        const centers: Coord[] = [];
        for (const cx of cxList) {
            for (const cy of cyList) {
                centers.push(new Coord(cx, cy));
            }
        }
        return centers;
    }

    private getHorizontalCenters(): number[] {
        if (this.side % 3 === 0) {
            return [this.side - 2, this.side -1, this.side];
        } else {
            return [this.side - 1];
        }
    }

    private getVerticalCenters(): number[] {
        if (this.side % 3 === 0) {
            const bottomCenter: number = 2 * this.side / 3;
            return [bottomCenter -1, bottomCenter];
        } else {
            return [this.side - (Math.ceil(this.side / 3))];
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
                    coords.push(new Coord(evenOffset +x, y));
                }
            }
        }
        return coords;
    }

}
