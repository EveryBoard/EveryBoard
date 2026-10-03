import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

import { TopologicShape } from './Shape';

export class HexagonalShape<D extends Direction> extends TopologicShape<D> {

    public constructor(
        public readonly side: number,
        topology: Topology<D>,
    ) {
        super(topology);
    }

    public getCenters(): Coord[] {
        return [
            new Coord(this.side - 1, this.side - 1),
        ];
    }

    public getAllCoords(): Coord[] {
        const coords: Coord[] = [];
        const maxIndex: number = (this.side - 1) * 2;
        for (let x: number = 0; x <= maxIndex; x++) {
            for (let y: number = 0; y <= maxIndex; y++) {
                const coord: Coord = new Coord(x, y);
                if (this.isOnBoard(coord)) {
                    coords.push(coord);
                }
            }
        }
        return coords;
    }

    public isOnBoard(coord: Coord): boolean {
        const x: number = coord.x;
        const y: number = coord.y;
        const minyx: number = this.side - 1;
        const maxyx: number = 3 * minyx;
        return minyx <= x + y && x + y <= maxyx;
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
