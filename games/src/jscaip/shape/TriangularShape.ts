import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../direction/Direction';
import { Topology } from '../topology/Topology';

import { TopologicShape } from './TopologicShape';

export class TriangularShape<D extends Direction> extends TopologicShape<D> {

    public constructor(
        private readonly side: number,
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
        const minyx: number = this.side - 1; // TODO: not naming in minyx
        for (let y: number = 0; y <= minyx; y++) {
            const minX: number = minyx + evenOffset - y;
            const maxX: number = minX + (2 * y);
            for (let x: number = minX; x <= maxX; x++) {
                if (this.isOnBoard(new Coord(x, y))) {
                    coords.push(new Coord(x, y));
                }
            }
        }
        return coords;
    }

    public isOnBoard(coord: Coord): boolean {
        const evenOffset: number = this.side % 2 === 0 ? 1 : 0;
        const minyx: number = this.side - 1; // TODO: not naming in minyx
        const minX: number = minyx + evenOffset - coord.y;
        const maxX: number = minX + (2 * coord.y);
        return minX <= coord.x && coord.x <= maxX &&
               0 <= coord.y && coord.y <= minyx;
    }

    public isNotOnBoard(coord: Coord): boolean {
        const evenOffset: number = this.side % 2 === 0 ? 1 : 0;
        const minyx: number = this.side - 1; // TODO: not naming in minyx
        const minX: number = - coord.y + minyx + evenOffset;
        const maxX: number = minX + (2 * coord.y);
        return maxX < coord.x || coord.x < minX ||
               minyx < coord.y || coord.y < 0;
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
