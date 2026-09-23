import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

import { TopologicShape } from './Shape';

export class TorusShape<D extends Direction> extends TopologicShape<D> {

    public constructor(
        public readonly width: number,
        public readonly height: number,
        topology: Topology<D>,
    ) {
        super(topology);
    }

    public getCenters(): Coord[] {
        return [
            new Coord(0, 0),
        ]; // TODO FOR REVIEW: mettre ça ou getAllCoords ?
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
        const nextX: number = ((next.x % this.width) + this.width) % this.width;
        const nextY: number = ((next.y % this.height) + this.height) % this.height;
        return MGPOptional.of(new Coord(nextX, nextY));
    }

}
