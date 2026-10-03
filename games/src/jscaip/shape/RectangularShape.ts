import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

import { TopologicShape } from './Shape';

export class RectangularShape<D extends Direction> extends TopologicShape<D> {

    public constructor(
        public readonly width: number,
        public readonly height: number,
        topology: Topology<D>,
    ) {
        super(topology);
    }

    public getCenters(): Coord[] {
        const cxList: number[] = this.getIntegerMidpoints(this.width - 1);
        const cyList: number[] = this.getIntegerMidpoints(this.height - 1);
        const centers: Coord[] = [];
        for (const cx of cxList) {
            for (const cy of cyList) {
                centers.push(new Coord(cx, cy));
            }
        }
        return centers;
    }

    private getIntegerMidpoints(value: number): number[] {
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

    public isOnBoard(coord: Coord): boolean {
        return 0 <= coord.x && coord.x < this.width &&
               0 <= coord.y && coord.y < this.height;
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
