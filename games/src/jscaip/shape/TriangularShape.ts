import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

import { TopologicShape } from './Shape';

export class TriangularShape<D extends Direction> extends TopologicShape<D> {

    public constructor(
        public readonly side: number,
        topology: Topology<D>,
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
        const maxIndex: number = (this.side - 1) * 2;
        for (let x: number = 0; x <= maxIndex; x++) {
            for (let y: number = 0; y < this.side; y++) {
                if (this.isOnBoard(new Coord(x, y))) {
                    coords.push(new Coord(evenOffset + x, y));
                }
            }
        }
        return coords;
    }

    public isOnBoard(coord: Coord): boolean {
        const minyx: number = this.side - 1;
        return minyx <= coord.x + coord.y && coord.x - coord.y < this.side;
    }

    public override getNextCoord(coord: Coord, direction: D, distance: number = 1): MGPOptional<Coord> {
        const next: Coord = this.getTopology().getNextCoord(coord, direction, distance);
        if (this.isOnBoard(next)) {
            return MGPOptional.of(next);
        } else {
            return MGPOptional.empty();
        }
    }
}
