import { Coord } from './Coord';
import { Direction } from './Direction';
import { NInARowHelper } from './NInARowHelper';
import { PlayerOrNone } from './Player';
import { Topology } from './topology/Topology';

export class TopologicNInARowHelper<T extends NonNullable<unknown>, D extends Direction>
    extends NInARowHelper<T, D>
{

    public constructor(
        getOwner: (piece: T) => PlayerOrNone,
        N: number,
        public readonly topology: Topology<D>,
    ) {
        super(getOwner, N);
    }

    protected override getDirections(): ReadonlyArray<D> {
        return this.topology.getDirections().toList();
    }

    protected override getNextCoord(coord: Coord, dir: D, distance: number = 1): Coord {
        return this.topology.getNextCoord(coord, dir, distance);
    }
}
