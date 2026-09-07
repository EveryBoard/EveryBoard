import { Set } from '@everyboard/lib';

import { Coord } from './Coord';
import { Direction } from './Direction';
import { NInARowHelper } from './NInARowHelper';
import { PlayerOrNone } from './Player';
import { Topology } from './topology/Topology';

export class TopologicNInARowHelper<T extends NonNullable<unknown>> extends NInARowHelper<T, Direction> {

    public constructor(
        getOwner: (piece: T) => PlayerOrNone,
        N: number,
        public readonly topology: Topology,
    ) {
        super(getOwner, N);
    }

    protected override getDirections(): Set<Direction> {
        return this.topology.getDirections();
    }

    protected override getNextCoord(coord: Coord, dir: Direction, distance: number = 1): Coord {
        return this.topology.getNextCoord(coord, dir, distance);
    }
}
